<?php

namespace Bundle\CommonBundle\Entity;

use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Entity
 * @ORM\Table("People")
 * @ORM\Entity(repositoryClass="Bundle\CommonBundle\Entity\UserRepository")
 */
class User extends \FOS\UserBundle\Model\User
{
    /**
     * @ORM\Id
     * @ORM\Column(type="integer")
     * @ORM\GeneratedValue(strategy="AUTO")
     */
    protected $id;

    /**
     * @var string
     *
     * @ORM\Column(name="fullname", type="string", nullable=false)
     */
    private $fullname;

    /**
     * @var integer
     *
     * @ORM\Column(name="likeSendCount", type="integer", options={"default" = 0})
     */
    private $likeSendCount = 0;

    /**
     * @var integer
     *
     * @ORM\Column(name="dislikeSendCount", type="integer", options={"default" = 0})
     */
    private $dislikeSendCount = 0;

    /**
     * @var integer
     *
     * @ORM\Column(name="likeReceiveCount", type="integer", options={"default" = 0})
     */
    private $likeReceiveCount = 0;

    /**
     * @var integer
     *
     * @ORM\Column(name="dislikeReceiveCount", type="integer", options={"default" = 0})
     */
    private $dislikeReceiveCount = 0;

    /**
     * @var integer
     *
     * @ORM\Column(name="songCount", type="integer", options={"default" = 0})
     */
    private $songCount = 0;

    /**
     * @ORM\ManyToOne(targetEntity="Bundle\CommonBundle\Entity\Room\Room", cascade={"persist"}, inversedBy="users")
     * @ORM\JoinColumn(name="roomId", referencedColumnName="id", onDelete="SET NULL", nullable=true)
     **/
    private $room;

    /**
     * @ORM\OneToMany(targetEntity="Bundle\CommonBundle\Entity\Song\Song", mappedBy="author")
     **/
    private $songs;

    /**
     * @ORM\OneToMany(targetEntity="Bundle\CommonBundle\Entity\Vote\Vote", mappedBy="author")
     **/
    private $votes;

    /**
     * @ORM\OneToMany(targetEntity="Bundle\CommonBundle\Entity\Room\Room", mappedBy="author")
     **/
    private $rooms;

    /*******************************************************/
    /*                   DO NOT REMOVE THIS CODE           */
    /*******************************************************/

    public function __construct($password = null) {
        parent::__construct();
        $this->password = $password;
        $this->songs = new \Doctrine\Common\Collections\ArrayCollection();
        $this->votes = new \Doctrine\Common\Collections\ArrayCollection();
        $this->rooms = new \Doctrine\Common\Collections\ArrayCollection();
    }

    public function setUsername($username)
    {
        $this->username = $username;

        if (empty($this->fullname)) {
            $this->fullname = $this->username;
        }

        return $this;
    }

    /**
     * @return string
     */
    public function getFullname()
    {
        return $this->fullname;
    }

    /**
     * @param string $fullname
     *
     * @return User
     */
    public function setFullname($fullname)
    {
        $this->fullname = $fullname;

        return $this;
    }

    /**
     * @param \Bundle\CommonBundle\Entity\Vote\Vote $vote
     * @return User
     */
    public function addVote(\Bundle\CommonBundle\Entity\Vote\Vote $vote)
    {
        $this->votes[] = $vote;

        return $this;
    }

    /**
     * @param \Bundle\CommonBundle\Entity\Vote\Vote $vote
     */
    public function removeVote(\Bundle\CommonBundle\Entity\Vote\Vote $vote)
    {
        $this->votes->removeElement($vote);
    }

    /**
     * @return \Doctrine\Common\Collections\Collection
     */
    public function getVotes()
    {
        return $this->votes;
    }

    /**
     * @param \Bundle\CommonBundle\Entity\Song\Song $song
     * @return User
     */
    public function addSong(\Bundle\CommonBundle\Entity\Song\Song $song)
    {
        $this->songs[] = $song;

        return $this;
    }

    /**
     * @param \Bundle\CommonBundle\Entity\Song\Song $song
     */
    public function removeSong(\Bundle\CommonBundle\Entity\Song\Song $song)
    {
        $this->songs->removeElement($song);
    }

    /**
     * @return \Doctrine\Common\Collections\Collection
     */
    public function getSongs()
    {
        return $this->songs;
    }

    /**
     * @return mixed
     */
    public function getLikeSendCount()
    {
        return $this->likeSendCount;
    }

    /**
     * @param int $likeSendCount
     *
     * @return User
     */
    public function setLikeSendCount($likeSendCount)
    {
        $this->likeSendCount = $likeSendCount;

        return $this;
    }

    /**
     * @return mixed
     */
    public function getDislikeSendCount()
    {
        return $this->dislikeSendCount;
    }

    /**
     * @param int $dislikeSendCount
     *
     * @return User
     */
    public function setDislikeSendCount($dislikeSendCount)
    {
        $this->dislikeSendCount = $dislikeSendCount;

        return $this;
    }

    /**
     * @return int
     */
    public function getDislikeReceiveCount()
    {
        return $this->dislikeReceiveCount;
    }

    /**
     * @param int $dislikeReceiveCount
     *
     * @return User
     */
    public function setDislikeReceiveCount($dislikeReceiveCount)
    {
        $this->dislikeReceiveCount = $dislikeReceiveCount;

        return $this;
    }

    /**
     * @return int
     */
    public function getLikeReceiveCount()
    {
        return $this->likeReceiveCount;
    }

    /**
     * @param int $likeReceiveCount
     *
     * @return User
     */
    public function setLikeReceiveCount($likeReceiveCount)
    {
        $this->likeReceiveCount = $likeReceiveCount;

        return $this;
    }

    /**
     * @return mixed
     */
    public function getSongCount()
    {
        return $this->songCount;
    }

    /**
     * @param mixed $songCount
     *
     * @return User
     */
    public function setSongCount($songCount)
    {
        $this->songCount = $songCount;

        return $this;
    }

    /**
     * @param Room $room
     *
     * @return boolean
     */
    public function inRoom($room)
    {
        return $this->room === $room;
    }

    /**
     * @return Room
     */
    public function getRoom()
    {
        return $this->room;
    }

    /**
     * @param Room $room
     *
     * @return User
     */
    public function setRoom($room)
    {
        $this->room = $room;

        return $this;
    }

    public function incrementSongCount()
    {
        $this->songCount++;
    }

    public function incrementLikeSendCount()
    {
        $this->likeSendCount++;
    }

    public function incrementDislikeSendCount()
    {
        $this->dislikeSendCount++;
    }

    public function incrementLikeReceiveCount()
    {
        $this->likeReceiveCount++;
    }

    public function incrementDislikeReceiveCount()
    {
        $this->dislikeReceiveCount++;
    }

    /**
     * @return \Doctrine\Common\Collections\Collection
     */
    public function getRooms()
    {
        return $this->rooms;
    }
}