<?php

namespace Bundle\CommonBundle\Service;

use Bundle\CommonBundle\Service\DklabRealplexor;

class RealplexorManager
{

    /**
     * @var DklabRealplexor
    */
    private $_realplexor;

    /**
     * Конструктор
     *
     * @param DklabRealplexor $realplexor
     */
    public function __construct(DklabRealplexor $realplexor)
    {
        $this->_realplexor = $realplexor;
    }

    /**
     * @return DklabRealplexor
     */
    public function getRealplexor()
    {
        return $this->_realplexor;
    }

    /**
     * @param string $channel
     * @param mixed $data
     * @throws \Exception
     *
     * @return mixed
     */
    public function send($channel, $data)
    {
        if (empty($data)) {
            return; // TODO: Maybe use exception here?
        }

        try {
            $this->_realplexor->send($channel, $data);
        }
        catch(DklabRealplexorException $ex) {
            throw new \Exception($ex->getMessage(), 0, $ex);
        }
    }
}