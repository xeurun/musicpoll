<?php

namespace Bundle\CommonBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\Form\FormInterface;

/**
 * Class BaseController
 * @package Bundle\CommonBundle\Controller
 */
class BaseController extends Controller
{
    const FORM_TRANSLATE_DOMAIN = 'form';

    /** Get entity repository
     * @param $entity
     *
     * @return \Doctrine\ORM\EntityRepository
     */
    protected function getRepository($entity)
    {
        return $this->container->get(sprintf('%s.repository', $entity));
    }

    /** Get current environment
     * @return string
     */
    protected function getEnvironment()
    {
        return $this->get('service_container')->getParameter('kernel.environment');
    }

    /** Get translated message
     * @param string $message
     * @param string $domain
     * @param array  $params
     *
     * @return string
     */
    protected function translate($message, $domain = null, $params = array())
    {
        return $this->get('translator')->trans($message, $params, $domain);
    }

    /**
     * Get form errors
     * @param FormInterface $form
     *
     * @return string
     */
    protected function getFormErrors(FormInterface $form)
    {
        $message = '';
        foreach ($form->getErrors() as $error) {
            $message .= sprintf("%s\n", $error->getMessage());
        }
        foreach ($form->all() as $children) {
            $title = $this->translate(sprintf('%s.%s', $form->getName(), $children->getName()), self::FORM_TRANSLATE_DOMAIN);
            foreach ($children->getErrors() as $error) {
                $msg            = sprintf('%s.%s', $form->getName(), $children->getName());
                $translatedText = $this->translate($msg, self::FORM_TRANSLATE_DOMAIN, $error->getMessageParameters());
                $message .= sprintf("%s: %s\n", $title, $translatedText);
            }
        }

        return $message;
    }
}
