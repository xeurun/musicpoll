<?php

namespace Bundle\MainBundle\Controller;

use Bundle\CommonBundle\Entity\Song\Song;
use Bundle\CommonBundle\Form\Song\SongType;
use Symfony\Component\HttpFoundation\Request;
use Bundle\CommonBundle\Response\JsonResponse;
use Bundle\CommonBundle\Controller\BaseController;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Method;
use Bundle\CommonBundle\Entity\Song\SongRepository;
use Bundle\CommonBundle\Entity\Vote\Vote;
use Symfony\Component\Security\Core\Exception\AccessDeniedException;

/**
 * Class ApiController
 * @Route("/api", name="homepage")
 * @package Bundle\MainBundle\Controller
 */
class ApiController extends BaseController
{
    const SONG_LIMIT = 25;

    /**
     * @param \Bundle\CommonBundle\Entity\Song\Song $entity
     * @return mixed
     */
    private function _getSongFileds($entity) {
        return array(
            "id"        => $entity->getId(),
            "url"       => $entity->getUrl(),
            "type"      => $entity->getType(),
            "title"     => $entity->getTitle(),
            "artist"    => $entity->getArtist(),
            "author"    => $entity->getAuthor()->getId(),
            "counter"   => $entity->getCounter(),
            "duration"  => $entity->getDuration(),
            "author"    => $entity->getAuthor()->getFullname()
        );
    }

    /**
     * @Route("/", name="api")
     */
    public function indexAction()
    {
        /** @var var SongRepository $repository */
        $repository = $this->getRepository('song');
        $entities = $repository->findBy(array(), array(), self::SONG_LIMIT, 0);
        $response = new JsonResponse();
        /** @var var Song $entity */
        foreach ($entities as $entity) {
            $jsonData[$entity->getId()] = $this->_getSongFileds($entity);
        }
        $response->setJsonContent($jsonData);

        return $response;
    }

    /**
     * @Route("/getPortion/{offset}", requirements={"offset" = "\d+|_OFFSET_"}, name="get_portion")
     */
    public function _getPortion(Request $request, $offset)
    {
        /** @var var SongRepository $repository */
        $repository = $this->getRepository('song');
        $entities = $repository->findBy(array(), array(), self::SONG_LIMIT, $offset);
        $response = new JsonResponse();
        /** @var var Song $entity */
        foreach ($entities as $entity) {
            $jsonData['entities'][$entity->getId()] = $this->_getSongFileds($entity);
        }
        $jsonData['count'] = count($entities);
        $response->setJsonContent($jsonData);

        return $response;
    }

    /**
     * @Route("/getForm", name="form")
     * @Method("GET")
     * @Template("MainBundle:Main/Form:song.html.twig")
     */
    public function formAction()
    {
        $songForm = $this->createForm(new SongType(), new Song());

        return array('songForm' => $songForm->createView());
    }

    /**
     * @Route("/getUsers", name="get_users")
     * @Method("GET")
     * @return mixed
     */
    public function getUsersAction()
    {
        $response = new JsonResponse();
        $users = $this->get('fos_user.user_manager')->findUsers();
        foreach($users as $user) {
            $jsonData['users'][] = array(
                'id'        => $user->getId(),
                'fullname'  => $user->getFullname(),
                'admin'     => $user->hasRole('ROLE_ADMIN'),
                'songs'     => count($user->getSongs()),
                'votes'     => count($user->getVotes())
            );
        }
        $response->setJsonContent($jsonData);

        return $response;
    }

    /**
     * @Route("/vote/{id}/{choose}", requirements={"id" = "\d+|_ID_"}, name="vote")
     * @Method("POST")
     */
    public function voteAction(Request $request, $id, $choose)
    {
        $response = new JsonResponse();
        $jsonData = array();
        try {
            if(!$vote = $this->getRepository('vote')->findBy(array('song' => $id, 'author' => $this->getUser()))) {
                $repository = $this->getRepository('song');
                if($song = $repository->find($id)) {
                    $count = $song->getCounter();
                    $choose === 'true' ? $count++ : $count--;
                    $song->setCounter($count);
                    $vote = new Vote($song, $this->getUser());
                    $song->addVote($vote);
                    $this->getRepository('vote')->save($vote);
                    $this->get('drklab.realplexor.manager')->send("Update_Song", array(
                        'id' => $song->getId(),
                        'count' => $count,
                        'message' => sprintf("%s проголосовал %s %s!", $this->getUser()->getFullname(),
                            ($choose === 'true' ? 'за' : 'против'),
                            $song->getTitle()
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
     */
    public function addAction(Request $request)
    {
        $response = new JsonResponse();
        $jsonData = array();
        $song = new Song();
        $song->setAuthor($this->getUser());
        $song->setCounter(1);
        $form = $this->createForm(new SongType(), $song);
        $form->handleRequest($request);
        if ($form->isValid()) {
            try {
                $vote = new Vote($song, $this->getUser());
                $song->addVote($vote);
                $this->getRepository('vote')->save($vote);
                $this->get('drklab.realplexor.manager')->send("Add_Song", array(
                    'id' => $song->getId(),
                    'song' => $this->_getSongFileds($song)
                ));
                $jsonData['message'] = 'Песня добавлена!';
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
     * @Route("/remove/{id}", requirements={"id" = "\d+|_ID_"}, name="remove")
     * @Method("POST")
     */
    public function removeAction(Request $request, $id)
    {
        $response = new JsonResponse();
        $jsonData = array();
        try {
            if (!$this->getUser()->hasRole('ROLE_ADMIN')) {
                throw new AccessDeniedException();
            }
            /** @var Songrepository $songRepository */
            $songRepository = $this->getRepository('song');
            if($song = $songRepository->find($id)) {
                $songRepository->remove($song);
                $this->get('drklab.realplexor.manager')->send("Remove_Song", $id);
                $jsonData['message'] = 'Песня удалена!';
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
     * @Method("POST")
     */
    public function muteAction(Request $request, $on)
    {
        $this->get('drklab.realplexor.manager')->send("Mute_Song", $on);
        $response = new JsonResponse();
        $jsonData = array();
        $fullname = $this->getUser()->getFullname();
        if($on === "true") {
            $jsonData['message'] = "$fullname убавил звук!";
        } else {
            $jsonData['message'] = "$fullname восстановил звук!";
        }
        $response->setJsonContent($jsonData);

        return $response;
    }

    /**
     * @Route("/nextSong", name="next_song")
     * @Method("POST")
     */
    public function nextSongAction(Request $request)
    {
        if (!$this->getUser()->hasRole('ROLE_ADMIN')) {
            throw new AccessDeniedException();
        }
        $id = $request->get('id');
        $title = $request->get('title');
        $this->get('drklab.realplexor.manager')->send("Next_Song", array(
            'id' => $id,
            'title' => $title,
            'message' => "Сейчас играет: $title!"
        ));
        $response = new JsonResponse();
        $jsonData = array();
        $response->setJsonContent($jsonData);

        return $response;
    }
}
