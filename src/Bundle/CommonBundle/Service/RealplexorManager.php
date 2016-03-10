<?php

namespace Bundle\CommonBundle\Service;

use Bundle\CommonBundle\Service\DklabRealplexor;

class RealplexorManager
{

    /**
     * @var DklabRealplexor
     */
    private $realplexor;

    /**
     * Конструктор
     *
     * @param DklabRealplexor $realplexor
     */
    public function __construct(DklabRealplexor $realplexor)
    {
        $this->realplexor = $realplexor;
    }

    /**
     * @return DklabRealplexor
     */
    public function getRealplexor()
    {
        return $this->realplexor;
    }

    /**
     * @inheritdoc
     */
    public function cmdOnlineWithCounters($idPrefixes = null)
    {
        try {
            return $this->realplexor->cmdOnlineWithCounters($idPrefixes);
        } catch (DklabRealplexorException $ex) {
            throw new \Exception($ex->getMessage(), 0, $ex);
        }
    }

    /**
     * @inheritdoc
     */
    public function cmdWatch($fromPos, $idPrefixes = null)
    {
        try {
            return $this->realplexor->cmdWatch($fromPos, $idPrefixes);
        } catch (DklabRealplexorException $ex) {
            throw new \Exception($ex->getMessage(), 0, $ex);
        }
    }

    /**
     * @inheritdoc
     */
    public function send($channel, $data)
    {
        if (empty($data)) {
            return; // TODO: Maybe use exception here?
        }

        try {
            $this->realplexor->send($channel, $data);
        } catch (DklabRealplexorException $ex) {
            throw new \Exception($ex->getMessage(), 0, $ex);
        }
    }
}