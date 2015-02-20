<?php

namespace Bundle\CommonBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\Form\FormInterface;
use Bundle\CommonBundle\Response\JsonResponse;

/**
 * Class BaseController
 * @package Bundle\CommonBundle\Controller
 */
class BaseController extends Controller
{
    /** Error domain */
    const ERROR_DOMAIN = 'error';
    /** Окружение разработки */
    const ENV_DEV = 'dev';
    /** Form domain */
    const FORM_DOMAIN = 'form';

    /**
     * @param $entityName
     * @return EntityRepository
     */
    protected function getRepository($entityName)
    {
        $repository = sprintf('%s.repository', $entityName);

        return $this->container->get($repository);
    }

    /**
     * @return string
     */
    protected function getEnvironment()
    {
        return $this->get('service_container')->getParameter('kernel.environment');
    }

    /**
     * Перевод сообщения
     * @param string $message
     * @param string $domain
     * @return string
     */
    protected function getTranslate($message, $domain = null, $params = array())
    {
        return $this->get('translator')->trans($message, $params, $domain);
    }

    /**
     * Собирает ошибки формы
     * @param \Bundle\CommonBundle\Controller\FormInterface $form
     */
    protected function getFormError(FormInterface $form)
    {
        $message = '';
        foreach ($form->getErrors() as $error) {
            $message .= sprintf("%s\n", $error->getMessage());
        }
        foreach ($form->all() as $children) {
            $name = $this->getTranslate(sprintf('%s.%s', $form->getName(), $children->getName()), self::FORM_DOMAIN);
            foreach ($children->getErrors() as $error) {
                $key = sprintf('%s.%s%s', $form->getName(), $children->getName(), self::FORM_TRANS_POSTFIX);
                $erm = $this->getTranslate($key, self::FORM_DOMAIN, $error->getMessageParameters());
                if ($erm == $key) {
                    $erm = $error->getMessage();
                };
                $message .= sprintf("<span>%s:</span> %s\n", $name, $erm);
            }
        }

        return $message;
    }

    /**
     * Генерирование ошибки
     * @param $message
     * @param \Exception $e
     * @param string $route_name
     * @param FormInterface $form
     * @param array $translateParams
     * @return JsonResponse|RedirectResponse
     * @throws \Exception
     */
    protected function generateError($message, \Exception $e = null, FormInterface $form = null, $translateParams = array())
    {
        $translatedMessage = $this->getTranslate($message, self::ERROR_DOMAIN, $translateParams);
        if (!is_null($form)) {
            $formError = $this->getFormError($form);
            $translatedMessage = (empty($message))
                ? $formError
                : sprintf('%s<br>%s', $translatedMessage, $formError);
        }

        if (!is_null($e) && ($this->getEnvironment() == self::ENV_DEV)) {
            dump(new \Exception ($translatedMessage, 0, $e));die;
        }

        return $translatedMessage;
    }
}
