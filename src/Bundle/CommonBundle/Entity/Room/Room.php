<?php

namespace Bundle\CommonBundle\Entity\Room;

use Bundle\CommonBundle\Entity\BaseEntity;
use Bundle\CommonBundle\Entity\Song\Song;
use Bundle\CommonBundle\Entity\User;
use Doctrine\ORM\Mapping as ORM;

/**
 * Room
 *
 * @ORM\Table()
 * @ORM\Entity(repositoryClass="Bundle\CommonBundle\Entity\Room\RoomRepository")
 */
class Room extends BaseEntity
{
    /**
     * @var integer
     *
     * @ORM\Column(name="id", type="integer")
     * @ORM\Id
     * @ORM\GeneratedValue(strategy="AUTO")
     */
    private $id;

    /**
     * @var string
     *
     * @ORM\Column(name="password", type="text", nullable=true)
     */
    private $password;

    /**
     * @ORM\ManyToOne(targetEntity="Bundle\CommonBundle\Entity\User", cascade={"persist"}, inversedBy="rooms")
     * @ORM\JoinColumn(name="authorId", referencedColumnName="id", onDelete="CASCADE", nullable=false)
     */
    private $author;

    /**
     * @var integer
     *
     * @ORM\Column(name="skip", type="integer", options={"default" = 10})
     */
    private $skip = 0;

    /**
     * @var string
     *
     * @ORM\Column(name="radio", type="string", nullable=true)
     */
    private $radio;

    /**
     * @ORM\OneToMany(targetEntity="Bundle\CommonBundle\Entity\User", mappedBy="room")
     **/
    private $users;

    /*******************************************************/
    /*                   DO NOT REMOVE THIS CODE           */
    /*******************************************************/

    public function __construct($password) {
        $this->password = $password;
        $this->users = new \Doctrine\Common\Collections\ArrayCollection();
    }

    /*******************************************************/
    /*                   AUTO GENERATED CODE               */
    /*******************************************************/

    /**
     * Get id
     *
     * @return integer
     */
    public function getId()
    {
        return $this->id;
    }

    /**
     * @return string
     */
    public function getPassword()
    {
        return $this->password;
    }

    /**
     * @param string $password
     *
     * @return Room
     */
    public function setPassword($password)
    {
        $this->password = $password;

        return $this;
    }

    /**
     * @return User
     */
    public function getAuthor()
    {
        return $this->author;
    }

    /**
     * @param User $author
     *
     * @return Room
     */
    public function setAuthor(User $author)
    {
        $this->author = $author;

        return $this;
    }

    /**
     * @param User $user
     *
     * @return boolean
     */
    public function isAuthor(User $user)
    {
        return $this->author === $user;
    }

    /**
     * @return \Doctrine\Common\Collections\Collection
     */
    public function getUsers()
    {
        return $this->users;
    }

    /**
     * @return int
     */
    public function getSkip()
    {
        return $this->skip;
    }

    /**
     * @param int $skip
     *
     * @return Room
     */
    public function setSkip($skip)
    {
        $this->skip = $skip;

        return $this;
    }

    /**
     * @return string
     */
    public function getRadio()
    {
        return $this->radio;
    }

    /**
     * @param string $radio
     *
     * @return Room
     */
    public function setRadio($radio)
    {
        $this->radio = $radio;

        return $this;
    }
}
