<?php

namespace Bundle\CommonBundle\Entity;

use Symfony\Component\DependencyInjection\Container;
use Doctrine\ORM\EntityRepository;
use Doctrine\ORM\ORMException;
use Doctrine\ORM\QueryBuilder;
use Doctrine\ORM\Query;
use Bundle\CommonBundle\Entity\BaseEntity;

/**
 * BaseRepository
 */
class BaseRepository extends EntityRepository
{
    /** @var \Bundle\CommonBundle\Entity\User */
    public $currentUser;

    /**
     * @param \Symfony\Component\Security\Core\SecurityContext $securityContext
     */
    public function setSecurityContext(\Symfony\Component\Security\Core\SecurityContext $securityContext)
    {
        if ($token = $securityContext->getToken()) {
            if ($token->getUser() instanceof User) {
                $this->currentUser = $token->getUser();
            }
        }
    }

    /**
     * @return \Bundle\CommonBundle\Entity\User
     */
    public function getCurrentUser()
    {
        return $this->currentUser;
    }

    protected function prePersist(BaseEntity $entity) {
        if (method_exists($entity, 'setAuthor') && $this->getCurrentUser()) {
            $entity->setAuthor($this->getCurrentUser());
        }
    }

    private function start()
    {
        $em = $this->getEntityManager();
        $em->getConnection()->beginTransaction();
    }

    private function commit()
    {
        $em = $this->getEntityManager();
        $em->getConnection()->commit();
    }

    private function rollback()
    {
        $em = $this->getEntityManager();
        $em->getConnection()->rollback();
        $em->close();
    }

    public function save($entity)
    {
        $this->start();
        try {
            $em = $this->getEntityManager();
            if (is_null($entity->getId())) {
                $this->prePersist($entity);
                $entity->prePersist();
                $em->persist($entity);
            } else {
                $entity->preUpdate();
            }
            $em->flush();
            $this->commit();
        } catch (\Exception $ex) {
            $this->rollback();
            throw new ORMException($ex->getMessage(), 0, $ex);
        }
    }

    public function remove($entity)
    {
        $this->start();
        try {
            $em = $this->getEntityManager();
            $em->remove($entity);
            $em->flush();
            $this->commit();
        } catch (\Exception $ex) {
            $this->rollback();
            throw new ORMException($ex->getMessage(), 0, $ex);
        }
    }

    public function refresh($entity)
    {
        $this->getEntityManager()->refresh($entity);
    }
}
