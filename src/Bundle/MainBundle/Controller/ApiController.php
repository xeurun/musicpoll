<?php

namespace Bundle\MainBundle\Controller;

use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Security\Core\Exception\AccessDeniedException;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Method;

use Bundle\CommonBundle\Entity\Song\Song;
use Bundle\CommonBundle\Form\Song\SongType;
use Bundle\CommonBundle\Response\JsonResponse;
use Bundle\CommonBundle\Controller\BaseController;
use Bundle\CommonBundle\Entity\Song\SongRepository;
use Bundle\CommonBundle\Entity\Vote\Vote;

/**
 * Class ApiController
 * @Route("/api", name="homepage")
 * @package Bundle\MainBundle\Controller
 */
class ApiController extends BaseController
{
    const SONG_LIMIT = 25;

    /**
     * @param Song $song
     * @param integer $userId
     *
     * @return array
     */
    private function _getSongFileds($song, $userId = null) {
        return array(
            "id"        => $song->getId(),
            "url"       => $song->getUrl(),
            "title"     => $song->getTitle(),
            "voted"     => is_null($userId) ? false : $song->hasCurrentUserVote($userId),
            "artist"    => $song->getArtist(),
            "counter"   => $song->getCounter(),
            "duration"  => $song->getDuration(),
            "authorId"  => $song->getAuthor()->getId()
        );
    }

    /**
     * @Route("/getPortion/{offset}", requirements={"offset" = "\d+|_OFFSET_"}, name="get_portion")
     * @Method("GET")
     * @param Request $request
     * @param integer $offset
     *
     * @return JsonResponse
     */
    public function getPortion(Request $request, $offset)
    {
        $result = array();
        try {
            /** @var var SongRepository $repository */
            $repository = $this->getRepository('song');
            $entities   = $repository->getSongPortion($offset, self::SONG_LIMIT);
            foreach ($entities as $entity) {
                $result['entities'][$entity->getId()] = $this->_getSongFileds($entity, $this->getUser()->getId());
            }
            $result['count'] = count($entities);
        } catch (\Exception $ex) {
            $result['error'] = $ex->getMessage();
        }

        return new JsonResponse($result);
    }

    /**
     * @Route("/getUsers", name="get_users")
     * @Method("GET")
     *
     * @return JsonResponse
     */
    public function getUsersAction()
    {
        $result = array();
        $users = $this->getUser()->getRoom()->getUsers();
        foreach($users as $user) {
            $result['entities'][$user->getId()] = array(
                'id'        => $user->getId(),
                'admin'     => $user->hasRole('ROLE_ADMIN'),
                'fullname'  => $user->getFullname()
            );
        }

        return new JsonResponse($result);
    }

    /**
     * @Route("/vote/{id}/{choose}", requirements={"id" = "\d+|_ID_"}, name="vote")
     * @Method("PUT")
     * @param Request $request
     * @param integer $id
     * @param boolean $choose
     *
     * @return JsonResponse
     */
    public function voteAction(Request $request, $id, $choose)
    {
        $result = array();

        try {
            if(!$vote = $this->getRepository('vote')->findBy(array('song' => $id, 'author' => $this->getUser()))) {
                $repository = $this->getRepository('song');
                /** @var Song $song */
                if($song = $repository->find($id)) {
                    $dislike    = ($choose != "true");
                    $vote       = new Vote($song, $dislike);
                    $roomId     = $this->getUser()->getRoom()->getId();
                    $this->getRepository('vote')->save($vote);
                    $this->getRepository('song')->refresh($song);
                    $this->get('drklab.realplexor.manager')->send("Room$roomId", array (
                        'action'    => 'update',
                        'result'    => array(
                            'id'        => $song->getId(),
                            'count'     => $song->getCounter(),
                            'dislike'   => $dislike,
                            'authorId'  => $this->getUser()->getId()
                        )
                    ));
                } else {
                    $result['error'] = $this->translate('song.notFound');
                }
            } else {
                $result['error'] = $this->translate('vote.alreadyVote');
            }
        } catch (\Exception $ex) {
            $result['error'] = $ex->getMessage();
        }

        return new JsonResponse($result);
    }

    /**
     * @Route("/add", name="add")
     * @Method("POST")
     * @param Request $request
     *
     * @return JsonResponse
     */
    public function addAction(Request $request)
    {
        $result     = array();
        $room       = $this->getUser()->getRoom();
        $song       = new Song($room);
        $form       = $this->createForm(new SongType(), $song);
        $form->handleRequest($request);
        if ($form->isValid()) {
            try {
                $roomId = $room->getId();
                $this->getRepository('song')->save($song);
                $this->get('drklab.realplexor.manager')->send("Room$roomId", array (
                    'action'    => 'add',
                    'result'    => array(
                        'id' => $song->getId(),
                        'song' => $this->_getSongFileds($song)
                    )
                ));
            } catch (\Exception $ex) {
                $result['error'] = $this->translate('repository.save', 'error');
            }
        } else {
            $result['error'] = $this->getFormErrors($form);
        }

        return new JsonResponse($result);
    }

    /**
     * @Route("/remove/{id}", requirements={"id" = "\d+|_ID_"}, name="remove")
     * @Method("DELETE")
     * @param Request $request
     * @param integer $id
     *
     * @return JsonResponse
     */
    public function removeAction(Request $request, $id)
    {
        $result = array();

        try {
            /** @var SongRepository $songRepository */
            $songRepository = $this->getRepository('song');
            /** @var Song $song */
            if($song = $songRepository->find($id)) {
                $user   = $this->getUser();
                $room   = $user->getRoom();
                $roomId = $room->getId();
                if (!$room->isAuthor($user) && $user != $song->getAuthor()) {
                    throw new AccessDeniedException();
                }
                $song->setDeleted(true);
                $songRepository->save($song);
                $this->get('drklab.realplexor.manager')->send("Room$roomId", array (
                    'action'    => 'remove',
                    'result'    => array(
                        'id'        => $id,
                        'authorId'  => $user->getId()
                    )
                ));
            } else {
                $result['error'] = $this->translate('song.notFound');
            }
        } catch (\Exception $ex) {
            $result['error'] = $this->translate('repository.get', 'error');
        }

        return new JsonResponse($result);
    }

    /**
     * @Route("/mute/{on}", requirements={"on" = "false|true|_TYPE_"}, name="mute")
     * @Method("PUT")
     * @param Request $request
     * @param boolean $on
     *
     * @return JsonResponse
     */
    public function muteAction(Request $request, $on)
    {
        $result = array();
        $on     = ($on != "false");
        $roomId = $this->getUser()->getRoom()->getId();
        $this->get('drklab.realplexor.manager')->send("Room$roomId", array (
            'action'   => 'mute',
            'result'    => array(
                'on'        => $on,
                'save'      => $on,
                'author'    => $this->getUser()->getFullname()
            )
        ));

        return new JsonResponse($result);
    }

    /**
     * @Route("/rewind/{time}", requirements={"time" = "\d+|_TIME_"}, name="rewind")
     * @Method("PUT")
     * @param Request $request
     * @param integer $time
     *
     * @return JsonResponse
     */
    public function rewindAction(Request $request, $time)
    {
        $result = array();

        try {
            $user   = $this->getUser();
            $room   = $user->getRoom();
            $roomId = $room->getId();

            if (!$room->isAuthor($user)) {
                throw new AccessDeniedException();
            }

            $this->get('drklab.realplexor.manager')->send("Room$roomId", array (
                'action'    => 'rewind',
                'result'    => $time
            ));
        } catch (\Exception $ex) {
            $result['error'] = $this->translate('repository.get', 'error');
        }

        return new JsonResponse($result);
    }

    /**
     * @Route("/nextSong/{id}", requirements={"time" = "\d+|_ID_"}, name="next_song")
     * @Method("PUT")
     * @param Request $request
     * @param integer $id
     *
     * @return JsonResponse
     */
    public function nextSongAction(Request $request, $id)
    {
        $result = array();

        try {
            $user   = $this->getUser();
            $room   = $user->getRoom();
            $roomId = $room->getId();

            if (!$room->isAuthor($user)) {
                throw new AccessDeniedException();
            }

            $this->get('drklab.realplexor.manager')->send("Room$roomId", array (
                'action'    => 'next',
                'result'    => $id
            ));
        } catch (\Exception $ex) {
            $result['error'] = $this->translate('repository.get', 'error');
        }

        return new JsonResponse($result);
    }

    /**
     * @Route("/state", name="state")
     * @Method("GET|PUT")
     * @param Request $request
     *
     * @return JsonResponse
     */
    public function stateAction(Request $request)
    {
        $result = array();

        try {
            if($request->isMethod('GET')) {
                if($room = $this->getRepository('room')->find($request->get('room'))) {
                    $userId = $room->getAuthor()->getId();
                    $this->get('drklab.realplexor.manager')->send("User$userId", array (
                        'action'    => 'getState',
                        'result'    => $request->get('user')
                    ));
                }
            } else if($request->isMethod('PUT')) {
                $userId = $request->get('user');
                $this->get('drklab.realplexor.manager')->send("User$userId", array (
                    'action'    => 'setState',
                    'result'    => array(
                        'state' => $request->get('state')
                    )
                ));
            }
        } catch (\Exception $ex) {
            $result['error'] = $this->translate('repository.get', 'error');
        }

        return new JsonResponse($result);
    }

    /**
     * @Route("/play/{on}", requirements={"on" = "false|true|_TYPE_"}, name="play")
     * @Method("PUT")
     * @param Request $request
     * @param boolean $on
     *
     * @return JsonResponse
     */
    public function playAction(Request $request, $on)
    {
        $result = array();

        try {
            $play   = ($on != "false");
            $user   = $this->getUser();
            $room   = $user->getRoom();
            $roomId = $room->getId();

            if (!$room->isAuthor($user)) {
                throw new AccessDeniedException();
            }

            $this->get('drklab.realplexor.manager')->send("Room$roomId", array (
                'action'    => 'play',
                'result'    => $play
            ));
        } catch (\Exception $ex) {
            $result['error'] = $this->translate('repository.get', 'error');
        }

        return new JsonResponse($result);
    }

    /**
     * @Route("/userStatistics/{id}", requirements={"id" = "\d+|_ID_"}, name="user_statistics")
     * @Method("GET")
     * @Template("MainBundle:Main/Popup:userStatistics.html.twig")
     * @param Request $request
     * @param integer $id
     *
     * @return Responce
     */
    public function userStatisticsAction(Request $request, $id)
    {
        $user = $this->get('fos_user.user_manager')->findUserBy(array('id' => $id));

        return array(
            'user' => $user
        );
    }

    /**
     * @Route("/whoVote/{id}", requirements={"id" = "\d+|_ID_"}, name="who_vote")
     * @Method("GET")
     * @Template("MainBundle:Main/Popup:votes.html.twig")
     * @param Request $request
     * @param integer $id
     *
     * @return Responce
     */
    public function whoVoteAction(Request $request, $id)
    {
        $votes = $this->getRepository('vote')->findBy(array('song' => $id));

        return array(
            'votes' => $votes
        );
    }

    /**
     * @Route("/getForm", name="form")
     * @Method("GET")
     * @Template("MainBundle:Main/Form:song.html.twig")
     *
     * @return Responce
     */
    public function formAction()
    {
        $songForm = $this->createForm(new SongType(), new Song($this->getUser()->getRoom()));

        return array(
            'songForm' => $songForm->createView()
        );
    }
}
