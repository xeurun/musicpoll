<?php

namespace Bundle\MainBundle\Controller;

use Bundle\CommonBundle\Controller\BaseController;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;

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
        return array();
    }
}
