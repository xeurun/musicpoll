<?php

namespace Bundle\CommonBundle\Service;

class RealplexorManager
{
    private $params, $connect;

    public function __construct(array $params) {
        $this->params = $params;
    }

    public function send($channel, $data)
    {
        if(is_null($this->connect)) {
            $this->connect = new \Dklab_Realplexor($this->params['host'], $this->params['port'], $this->params['namespace']);
        }
        $this->connect->send($channel, $data);
    }
}