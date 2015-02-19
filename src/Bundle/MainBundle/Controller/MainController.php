<?php

namespace Bundle\MainBundle\Controller;

use Bundle\CommonBundle\Controller\BaseController;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Method;

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
        return array('config' => array(
            'realplexor_url' => $this->container->getParameter('realplexor_url'),
            'realplexor_namespace' => $this->container->getParameter('realplexor_namespace'),
        ));
    }
}
