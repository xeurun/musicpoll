<?php

namespace Bundle\MainBundle\Controller;

use Bundle\CommonBundle\Entity\Song\Song;
use Symfony\Component\HttpFoundation\Request;
use Bundle\CommonBundle\Response\JsonResponse;
use Bundle\CommonBundle\Controller\BaseController;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Method;
use Bundle\CommonBundle\Entity\Song\SongRepository;
use Bundle\CommonBundle\Entity\Vote\Vote;

/**
 * Class MainController
 * @package Bundle\MainBundle\Controller
 */
class MainController extends BaseController
{
    /**
     * @Route("/", name="homepage")
     * @Template()
     */
    public function indexAction()
    {
        /** @var var SongRepository $repository */
        $repository = $this->getRepository('song');
        $entities = $repository->findBy(array(), array('createdAt' => 'DESC'));

        return array('entities' => $entities);
    }

    /**
     * @Route("/vote/{id}/{choose}", requirements={"id" = "\d+"}, name="vote")
     * @Method("POST")
     */
    public function voteAction(Request $request, $id, $choose)
    {
        $response = new JsonResponse();
        $jsonData = array();
        try {
            $voteRepository = $this->getRepository('vote');
            //if(!$vote = $voteRepository->findBy(array('song' => $id, 'author' => $this->getUser()->getUsername()))) {
                $repository = $this->getRepository('song');
                if($song = $repository->find($id)) {
                    $rpl = new \Dklab_Realplexor("127.0.0.1", "10010", "musicpoll");
                    $count = $song->getCounter();
                    $choose === 'true' ? $count++ : $count--;
                    $song->setCounter($count);
                    //$vote = new Vote();
                    //$vote->setSong($song->getId());
                    //$vote->setAuthor($this->getUser()->getUsername());
                    //$voteRepository->save($vote);
                    $repository->save($song);
                    $jsonData['count'] = $count;
                    $rpl->send(array("Update_Song"), array('count' => $count, 'id' => $song->getId()));
                }
            //} else {
                //$jsonData['error'] = 'Вы уже голосовали!';
            //}
        } catch (\Exception $ex) {
            return $this->generateError('repository.get', $ex);
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
        $rpl = new \Dklab_Realplexor("127.0.0.1", "10010", "musicpoll");
        $data = $request->get('data');
        if(empty($data) || !isset($data['name']) || !isset($data['type']) || !isset($data['link'])) {
            return $response;
        }
        /** @var Songrepository $songRepository */
        $songRepository = $this->getRepository('song');
        $song = new Song();
        $song->setAuthor($this->getUser()->getUsername());
        $song->setName($data['name']);
        $song->setLink($data['link']);
        $song->setCounter(0);
        $song->setType($data['type']);

        $songRepository->save($song);
        $response->setJsonContent(array('view' => $this->renderView("MainBundle:Main:songTemplate.html.twig", array(
            'entity' => $song,
        ))));
        $rpl->send(array("Add_Song"), $this->renderView("MainBundle:Main:songTemplate.html.twig", array(
            'entity' => $song,
        )));

        return $response;
    }
}
