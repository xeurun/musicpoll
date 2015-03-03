<?php

namespace Bundle\MainBundle\Controller;

use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Security\Core\Exception\AccessDeniedException;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Method;

use Bundle\CommonBundle\Entity\Room\Room;
use Bundle\CommonBundle\Response\JsonResponse;
use Bundle\CommonBundle\Controller\BaseController;
use Bundle\CommonBundle\Entity\Room\RoomRepository;
use Symfony\Component\Translation\Exception\NotFoundResourceException;

/**
 * Class MainController
 * @package Bundle\MainBundle\Controller
 */
class MainController extends BaseController
{
    /**
     * @Route("/", name="homepage")
     * @Template()
     * @param Request $request
     *
     * @return Responce
     */
    public function indexAction(Request $request)
    {
        return array();
    }
    /**
     * @Route("/statistic", name="statistic")
     * @Template()
     * @param Request $request
     *
     * @return Responce
     */
    public function statisticAction(Request $request)
    {

        /** @var \FOS\UserBundle\Model\UserManager $userManager */
        $userManager = $this->get('fos_user.user_manager');
        return array(
            'users' => $this->getRepository('user')->getTopUsers(),
            'songs' => $this->getRepository('song')->getTopSongs()
        );
    }

    /**
     * @Route("/create", name="create")
     * @param Request $request
     *
     * @return Responce
     */
    public function createAction(Request $request)
    {
        $result = array(
            'message' => $this->translate('room.error', 'error')
        );

        $password = md5($request->get('password'));

        try {
            /** @var var RoomRepository $repository */
            $repository = $this->getRepository('room');
            if($room = $repository->findOneBy(array('author' => $this->getUser()))) {
                $repository->remove($room);
            }

            $room = new Room($password);
            $repository->save($room);
            $user = $this->getUser()->setRoom($room);
            $this->get('fos_user.user_manager')->updateUser($user);

            $result['message'] = null;
            $result['backUrl'] = $this->generateUrl('room', array('id' => $room->getId()));
        } catch (\Exception $ex) {
            $result['message'] = $ex->getMessage();
        }

        return new JsonResponse($result);
    }

    /**
     * @Route("/enter", name="enter")
     * @param Request $request
     *
     * @return Responce
     */
    public function enterAction(Request $request)
    {
        $result = array(
            'message' => $this->translate('room.wrongPassword', 'error')
        );

        $roomId = $request->get('roomId');
        $password = md5($request->get('password'));

        try {
            if(!empty($roomId) && $room = $this->getRepository('room')->find($roomId)) {
                if(is_null($room->getPassword()) || $room->isAuthor($this->getUser()) || $room->getPassword() === $password) {
                    $user = $this->getUser()->setRoom($room);
                    $this->get('fos_user.user_manager')->updateUser($user);
                    $this->get('drklab.realplexor.manager')->send("Room$roomId", array (
                        'action'    => 'enter',
                        'result'      => array(
                            'id'        => $user->getId(),
                            'admin'     => $user->hasRole('ROLE_ADMIN'),
                            'fullname'  => $user->getFullname()
                        )
                    ));
                    $result['message'] = null;
                    $result['backUrl'] = $this->generateUrl('room', array('id' => $roomId));
                }
            } else {
                $result['message'] = $this->translate('room.notFound', 'error');
            }
        } catch (\Exception $ex) {
            $result['message'] = $ex->getMessage();
        }

        return new JsonResponse($result);
    }

    /**
     * @Route("/room/{id}", name="room")
     * @Template()
     * @param Request $request
     * @param integer $id
     *
     * @return Responce
     */
    public function roomAction(Request $request, $id)
    {
        try {
            if($room = $this->getRepository('room')->find($id)) {
                if(!$this->getUser()->inRoom($room)) {
                    throw new AccessDeniedException();
                }
                return array(
                    'config' => array(
                        'realplexor_url'        => $this->container->getParameter('realplexor_url'),
                        'realplexor_namespace'  => $this->container->getParameter('realplexor_namespace'),
                    ),
                    'room' => $room
                );
            } else {
                //TODO: Release return error response
                throw new NotFoundResourceException();
            }
        } catch (\Exception $ex) {
            //TODO: Release return error response
            return new Response($ex->getMessage());
        }

        return array();
    }
}
