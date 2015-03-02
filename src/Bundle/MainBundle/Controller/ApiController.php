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
     * @param \Bundle\CommonBundle\Entity\Song\Song $song
     * @param integer $userId
     *
     * @return mixed
     */
    private function _getSongFileds($song, $userId = null) {
        return array(
            "id"        => $song->getId(),
            "url"       => $song->getUrl(),
            "type"      => $song->getType(),
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
        $response = new JsonResponse();
        $jsonData = array();

        try {
            /** @var var SongRepository $repository */
            $repository = $this->getRepository('song');
            $entities   = $repository->findBy(array('deleted' => false), array(), self::SONG_LIMIT, $offset);
            $userId     = $this->getUser()->getId();
            foreach ($entities as $entity) {
                $jsonData['entities'][$entity->getId()] = $this->_getSongFileds($entity, $userId);
            }
            $jsonData['count'] = count($entities);
        } catch (\Exception $ex) {
            $jsonData['error'] = $ex->getMessage();
        }

        $response->setJsonContent($jsonData);

        return $response;
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
        $songForm = $this->createForm(new SongType(), new Song());

        return array('songForm' => $songForm->createView());
    }

    /**
     * @Route("/getUsers", name="get_users")
     * @Method("GET")
     *
     * @return JsonResponse
     */
    public function getUsersAction()
    {
        $response = new JsonResponse();
        $jsonData = array();

        $users = $this->get('fos_user.user_manager')->findUsers();

        foreach($users as $user) {
            $jsonData['entities'][$user->getId()] = array(
                'id'                => $user->getId(),
                'fullname'          => $user->getFullname(),
                'admin'             => $user->hasRole('ROLE_ADMIN'),
                'songs'             => $user->getSongCount(),
                'sendLikes'         => $user->getLikeSendCount(),
                'sendDislikes'      => $user->getDislikeSendCount(),
                'receivedLikes'     => $user->getLikeReceiveCount(),
                'receivedDislikes'  => $user->getDislikeReceiveCount()
            );
        }

        $response->setJsonContent($jsonData);

        return $response;
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
        $response = new JsonResponse();
        $jsonData = array();

        try {
            if(!$vote = $this->getRepository('vote')->findBy(array('song' => $id, 'author' => $this->getUser()))) {
                $repository = $this->getRepository('song');
                if($song = $repository->find($id)) {
                    $dislike    = ($choose != "true");
                    $vote       = new Vote($song, $dislike);
                    $this->getRepository('vote')->save($vote);
                    $this->getRepository('song')->refresh($song);
                    $this->get('drklab.realplexor.manager')->send('Song', array (
                        'channel'   => 'update',
                        'result'    => array(
                            'id'        => $song->getId(),
                            'count'     => $song->getCounter(),
                            'dislike'   => $dislike,
                            'authorId'  => $this->getUser()->getId()
                        )
                    ));
                } else {
                    $jsonData['error'] = 'Песня ненайдена!';
                }
            } else {
                $jsonData['error'] = 'Вы уже голосовали!';
            }
        } catch (\Exception $ex) {
            $jsonData['error'] = $ex->getMessage();
        }

        $response->setJsonContent($jsonData);

        return $response;
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
        $response   = new JsonResponse();
        $jsonData   = array();
        $song       = new Song();
        $form       = $this->createForm(new SongType(), $song);
        $form->handleRequest($request);
        if ($form->isValid()) {
            try {
                $this->getRepository('song')->save($song);
                $this->get('drklab.realplexor.manager')->send('Song', array (
                    'channel'   => 'add',
                    'result'    => array(
                        'id' => $song->getId(),
                        'song' => $this->_getSongFileds($song, null)
                    )
                ));
            } catch (\Exception $ex) {
                $jsonData['error'] = $this->generateError('repository.save', $ex);
            }
        } else {
            $jsonData['error'] = $this->generateError(null, null, $form);
        }

        $response->setJsonContent($jsonData);

        return $response;
    }

    /**
     * @Route("/whoVote/{id}", requirements={"id" = "\d+|_ID_"}, name="who_vote")
     * @Method("GET")
     * @Template("MainBundle:Main/Include:voters.html.twig")
     * @param Request $request
     * @param integer $id
     *
     * @return Responce
     */
    public function whoVoteAction(Request $request, $id)
    {
        $voters = $this->getRepository('vote')->findBy(array('song' => $id));

        return array('voters' => $voters);
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
        $response = new JsonResponse();
        $jsonData = array();

        try {
            /** @var Songrepository $songRepository */
            $songRepository = $this->getRepository('song');
            if($song = $songRepository->find($id)) {
                if ($this->getUser() != $song->getAuthor() && !$this->getUser()->hasRole('ROLE_ADMIN')) {
                    throw new AccessDeniedException();
                }
                $song->setDeleted(true);
                $songRepository->save($song);
                $this->get('drklab.realplexor.manager')->send('Song', array (
                    'channel'   => 'remove',
                    'result'    => array(
                        'id'        => $id,
                        'authorId'  => $this->getUser()->getId()
                    )
                ));
            } else {
                $jsonData['error'] = 'Песня ненайдена!';
            }
        } catch (\Exception $ex) {
            $jsonData['error'] = $this->generateError('repository.get', $ex);
        }

        $response->setJsonContent($jsonData);

        return $response;
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
        $response = new JsonResponse();
        $jsonData = array();

        $on = ($on != "false");
        $this->get('drklab.realplexor.manager')->send('Song', array (
            'channel'   => 'mute',
            'result'    => array(
                'on'        => $on,
                'save'      => $on,
                'author'    => $this->getUser()->getFullname()
            )
        ));

        $response->setJsonContent($jsonData);

        return $response;
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
        $response = new JsonResponse();
        $jsonData = array();

        if (!$this->getUser()->hasRole('ROLE_ADMIN')) {
            throw new AccessDeniedException();
        }

        $this->get('drklab.realplexor.manager')->send('Song', array (
            'channel'   => 'rewind',
            'result'    => $time
        ));

        $response->setJsonContent($jsonData);

        return $response;
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
        $response = new JsonResponse();
        $jsonData = array();

        if (!$this->getUser()->hasRole('ROLE_ADMIN')) {
            throw new AccessDeniedException();
        }

        $this->get('drklab.realplexor.manager')->send('Song', array (
            'channel'   => 'next',
            'result'    => $id
        ));

        $response->setJsonContent($jsonData);

        return $response;
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
        $response = new JsonResponse();
        $jsonData = array();

        if (!$this->getUser()->hasRole('ROLE_ADMIN')) {
            throw new AccessDeniedException();
        }

        $play = ($on != "false");
        $this->get('drklab.realplexor.manager')->send('Song', array (
            'channel'   => 'play',
            'result'    => $play
        ));

        $response->setJsonContent($jsonData);

        return $response;
    }
}
