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

/**
 * Class ApiController
 * @Route("/api", name="homepage")
 * @package Bundle\MainBundle\Controller
 */
class ApiController extends BaseController
{
    const SONG_LIMIT = 25;
    private function _getSongFileds($entity) {
        return array(
            "id"        => $entity->getId(),
            "counter"   => $entity->getCounter(),
            "author"    => $entity->getAuthor()->getId(),
            "title"     => $entity->getTitle(),
            "type"      => $entity->getType(),
            "url"       => $entity->getUrl()
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
                throw $this->createAccessDeniedException();
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
    public function muteAction($on)
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
}
