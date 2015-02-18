<?php

namespace Bundle\CommonBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\JsonResponse;

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
     * Генерирование ошибки
     * @param $message
     * @param \Exception $e
     * @param string $route_name
     * @param FormInterface $form
     * @param array $translateParams
     * @return JsonResponse|RedirectResponse
     * @throws \Exception
     */
    protected function generateError($message, \Exception $e = null, $route_name = 'homepage', FormInterface $form = null, $translateParams = array())
    {
        /** переводим сообщение */
        $translatedMessage = $this->getTranslate($message, self::ERROR_DOMAIN, $translateParams);

        /** собираем ошибки формы */
        if (! is_null($form)) {
            $formError = $this->getFormError($form);
            $translatedMessage = (empty($message))
                ? $formError
                : sprintf('%s<br>%s', $translatedMessage, $formError);
        }

        /** для отладки */
        if (!is_null($e) && ($this->getEnvironment() == self::ENV_DEV)) {
            throw new \Exception ($translatedMessage, 0, $e);
        }

        /** если ajax запрос */
        if ($this->getRequest()->isXmlHttpRequest()) {
            $json = new JsonResponse();
            $json->setError($translatedMessage);
            $json->setStatusCode(417);//417 Expectation Failed "ожидаемое неприемлемо"

            return $json;
        } else {
            $this->_setFlashError($translatedMessage);

            return $this->redirect($this->generateUrl($route_name));
        }
    }
}
