<?php

namespace Bundle\MainBundle\Controller;

use Bundle\CommonBundle\Entity\User;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Security;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
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
 * @Route("/api")
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
            "authorId"  => $song->getAuthor()->getId(),
            "author"    => $song->getAuthor()->getFullname(),
            "genre_id"  => $song->getGenreId()
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
            /** @var SongRepository $repository */
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
                    $user       = $this->getUser();
                    $roomId     = $user->getRoom()->getId();
                    $this->getRepository('vote')->save($vote);
                    $this->getRepository('song')->refresh($song);
                    $this->get('drklab.realplexor.manager')->send("Room$roomId", array (
                        'action'    => 'update',
                        'result'    => array(
                            'id'        => $song->getId(),
                            'count'     => $song->getCounter(),
                            'dislike'   => $dislike,
                            'authorId'  => $user->getId(),
                            'author'    => $user->getFullname()
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
     * @Route("/setting/{id}", requirements={"id" = "\d+|_ID_"}, name="setting")
     * @Method("PUT")
     * @param Request $request
     * @param integer $id
     *
     * @return JsonResponse
     */
    public function settingAction(Request $request, $id)
    {
        $result = array();

        $skip   = $request->get('skip');
        $radio  = $request->get('radio');

        try {
            $roomRepository = $this->getRepository('room');
            /** @var \Bundle\CommonBundle\Entity\Room\Room $room */
            if($room = $roomRepository->find($id)) {
                if(!$room->isAuthor($this->getUser())) {
                    throw new AccessDeniedException();
                }

                $room->setSkip($skip);
                $room->setRadio($radio);

                $this->get('drklab.realplexor.manager')->send("Room$id", array (
                        'action'    => 'setting',
                        'result'    => array(
                            'radio' => $radio,
                            'skip'  => $skip
                        )
                    )
                );

                $roomRepository->save($room);
            } else {
                $result['error'] = $this->translate('room.notFound');
            }
        } catch (\Exception $ex) {
            $result['error'] = $ex->getMessage();
        }

        return new JsonResponse($result);
    }

    /**
     * @Route("/profile", name="profile")
     * @Method("PUT")
     * @param Request $request
     *
     * @return JsonResponse
     */
    public function profileAction(Request $request)
    {
        $result = array();

        $background = $request->get('background');

        try {
            $user = $this->getUser();
            $user->setBackground($background);

            $this->getRepository('user')->save($user);
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
                $result['error'] = $ex->getMessage();
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
                /** @var \Bundle\CommonBundle\Entity\User $user */
                $user   = $this->getUser();
                $room   = $user->getRoom();
                $roomId = $room->getId();
                if (!$room->isAuthor($user) && $user != $song->getAuthor() && !$user->hasRole('ROLE_ADMIN')) {
                    throw new AccessDeniedException();
                }
                $song->setDeleted(true);
                $songRepository->save($song);
                $this->get('drklab.realplexor.manager')->send("Room$roomId", array (
                    'action'    => 'remove',
                    'result'    => array(
                        'id'        => $id,
                        'author'    => $user->getFullname(),
                        'system'    => $request->get('system')
                    )
                ));
            } else {
                $result['error'] = $this->translate('song.notFound');
            }
        } catch (\Exception $ex) {
            $result['error'] = $ex->getMessage();
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
     * @Route("/skip", name="skip")
     * @Method("PUT")
     * @param Request $request
     *
     * @return JsonResponse
     */
    public function skipAction(Request $request)
    {
        $result = array();
        $roomId = $this->getUser()->getRoom()->getId();
        $this->get('drklab.realplexor.manager')->send("Room$roomId", array (
                'action'    => 'skip',
                'result'    => array(
                    'id'        => $this->getUser()->getId(),
                    'fullname'  => $this->getUser()->getFullname()
                )
            )
        );

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
            $result['error'] = $ex->getMessage();
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
            $result['error'] = $ex->getMessage();
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
            $result['error'] = $ex->getMessage();
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
            $result['error'] = $ex->getMessage();
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
     * @return Response
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
     * @return Response
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
     * @return Response
     */
    public function formAction()
    {
        $songForm = $this->createForm(new SongType(), new Song($this->getUser()->getRoom()));

        return array(
            'songForm' => $songForm->createView()
        );
    }

    /**
     * @Route("/appCommand", name="app_command")
     * @Method("POST")
     * @param Request $request
     *
     * @return JsonResponse
     */
    public function appCommandAction(Request $request)
    {
        $token   = $request->request->get('token');
        $command = $request->request->get('command');
        $content = $request->request->get('content');
        
        if(!empty($token)) {
            $user = $this->getRepository('user')->findByToken($token);
            
            if($user instanceof User) {
                $room = $user->getRoom();

                $this->get('drklab.realplexor.manager')->send("Room{$room->getId()}", array (
                    'action'    => 'appCommand',
                    'result'    => [
                        'user'    => $user->getId(),
                        'command' => $command,
                        'content' => $content
                    ]
                ));
            }
        }

        return new JsonResponse([
            'success' => true
        ]);
    }
}
