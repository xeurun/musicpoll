<?php

namespace Bundle\CommonBundle\Response;

use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\Request;

/**
 * Custom JsonResponse
 */
class JsonResponse extends Response
{
    /**
     * @var string
     */
    protected $message = '';

    /**
     * @var array
     */
    protected $content = array();

    public function __construct($data = array(), $headers = array())
    {
        parent::__construct('', 200, $headers);
        $this->headers->set('Content-type', 'application/json; charset=utf-8');
        $this->setContent($data);
    }

    /**
     * @param array $responseData
     *
     * @return JsonResponse
     */
    public function setContent($responseData)
    {
        $this->content = $responseData;

        return $this;
    }

    public function prepare(Request $request)
    {
        $content = $this->content;
        if (!empty($this->_error)) {
            $content = array_merge($content, array(
                'error' => $this->error
            ));
        }

        $this->setContent(json_encode($content));

        parent::prepare($request);
    }

    /**
     * Назначает текст ошибки
     * @param string $error
     */
    public function setError($error)
    {
        if (is_string($error)) {
            $this->error = $error;
        } else {
            throw new \Symfony\Component\Routing\Exception\InvalidParameterException(sprintf('Variable $error must be string, %s given', gettype($error)));
        }
    }
}
