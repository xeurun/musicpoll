<?php

namespace Bundle\CommonBundle\Response;

use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\Request;

/**
 * Класс json-ответа
 */
class JsonResponse extends Response
{
    /**
     * Текст ошибки, передаваемой в ответе
     * @var string
     */
    protected $_error = '';

    /**
     * Массив, содержащий структуру ответа
     * Может содержать в качестве значения определенного ключа объект, имеющий метод jsonSerialize
     * @var array
     */
    protected $_jsonContent = array();


    /**
     * Конструктор
     */
    public function __construct($headers=array())
    {
        parent::__construct('', 200, $headers);

        $this->headers->set('Content-type', 'application/json; charset=utf-8');
    }

    /**
     * Подготовка перед отправкой клиенту
     */
    public function prepare(Request $request)
    {
        $content = $this->_jsonContent;

        if (!empty($this->_error)) {
            $content = array_merge($content, array('error' => $this->_error));
        }

        self::setContent(json_encode($content));

        parent::prepare($request);
    }

    /**
     * Назначает контент для ответа, отправляемого в виде JSON
     * @param array $responseData
     */
    public function setJsonContent(array $responseData)
    {
        $this->_jsonContent = $responseData;
    }

    /**
     * Назначает текст ошибки
     * @param string $error
     */
    public function setError($error)
    {
        if (is_string($error)) {
            $this->_error = $error;
        } else {
            throw new \Symfony\Component\Routing\Exception\InvalidParameterException(sprintf('Variable $error must be string, %s given', gettype($error)));
        }
    }
}
