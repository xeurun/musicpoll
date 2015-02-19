<?php

namespace Bundle\CommonBundle\Entity;

use FOS\UserBundle\Model\User as BaseUser;
use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Entity
 * @ORM\Table("People")
 */
class User extends BaseUser
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
     * @ORM\Column(name="fullname", type="text", nullable=false)
     */
    protected $fullname;

    /**
     * @ORM\OneToMany(targetEntity="Bundle\CommonBundle\Entity\Song\Song", mappedBy="author")
     **/
    private $songs;

    /**
     * @ORM\OneToMany(targetEntity="Bundle\CommonBundle\Entity\Vote\Vote", mappedBy="author")
     **/
    private $votes;

    public function __construct()
    {
        parent::__construct();
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
     * @return User
     */
    public function setFullname($fullname)
    {
        $this->fullname = $fullname;

        return $this;
    }

    /**
     * Add vote
     *
     * @param \Bundle\CommonBundle\Entity\Vote\Vote $vote
     * @return User
     */
    public function addVote(\Bundle\CommonBundle\Entity\Vote\Vote $vote)
    {
        $this->votes[] = $vote;

        return $this;
    }

    /**
     * Remove vote
     *
     * @param \Bundle\CommonBundle\Entity\Vote\Vote $vote
     */
    public function removeVote(\Bundle\CommonBundle\Entity\Vote\Vote $vote)
    {
        $this->votes->removeElement($vote);
    }

    /**
     * Get votes
     *
     * @return \Doctrine\Common\Collections\Collection
     */
    public function getVotes()
    {
        return $this->votes;
    }

    /**
     * Add song
     *
     * @param \Bundle\CommonBundle\Entity\Song\Song $song
     * @return User
     */
    public function addSong(\Bundle\CommonBundle\Entity\Song\Song $song)
    {
        $this->songs[] = $song;

        return $this;
    }

    /**
     * Remove vote
     *
     * @param \Bundle\CommonBundle\Entity\Song\Song $song
     */
    public function removeSong(\Bundle\CommonBundle\Entity\Song\Song $song)
    {
        $this->songs->removeElement($song);
    }

    /**
     * Get songs
     *
     * @return \Doctrine\Common\Collections\Collection
     */
    public function getSongs()
    {
        return $this->songs;
    }
}