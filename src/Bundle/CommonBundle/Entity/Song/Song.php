<?php

namespace Bundle\CommonBundle\Entity\Song;

use Bundle\CommonBundle\Entity\BaseEntity;
use Doctrine\ORM\Mapping as ORM;

/**
 * Song
 *
 * @ORM\Table()
 * @ORM\Entity(repositoryClass="Bundle\CommonBundle\Entity\Song\SongRepository")
 */
class Song extends BaseEntity
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
     * @ORM\Column(name="title", type="text", nullable=false)
     */
    private $title;

    /**
     * @var string
     *
     * @ORM\Column(name="url", type="text", nullable=false)
     */
    private $url;

    /**
     * @var string
     *
     * @ORM\Column(name="artist", type="text", nullable=true)
     */
    private $artist;

    /**
     * @var integer
     *
     * @ORM\Column(name="duration", type="integer", nullable=true)
     */
    private $duration;

    /**
     * @var string
     *
     * @ORM\Column(name="type", type="text", nullable=false)
     */
    private $type;

    /**
     * @var integer
     *
     * @ORM\Column(name="counter", type="integer", options={"default" = 0})
     */
    private $counter = 0;

    /**
     * @ORM\OneToMany(targetEntity="Bundle\CommonBundle\Entity\Vote\Vote", mappedBy="song")
     **/
    private $votes;

    /**
     * Идентификатор автора
     * @ORM\ManyToOne(targetEntity="Bundle\CommonBundle\Entity\User", inversedBy="songs")
     * @ORM\JoinColumn(nullable=true, name="authorId", referencedColumnName="id")
     */
    private $author;

    /**
     * @var boolean
     *
     * @ORM\Column(name="deleted", type="boolean", options={"default": false})
     */
    private $deleted = false;

    /*******************************************************/
    /*                   DO NOT REMOVE THIS CODE           */
    /*******************************************************/

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
    public function getTitle()
    {
        return $this->title;
    }

    /**
     * @param string $title
     */
    public function setTitle($title)
    {
        $this->title = $title;
    }

    /**
     * @return string
     */
    public function getUrl()
    {
        return $this->url;
    }

    /**
     * @param string $url
     */
    public function setUrl($url)
    {
        $this->url = $url;
    }

    /**
     * @return string
     */
    public function getType()
    {
        return $this->type;
    }

    /**
     * @param string $type
     */
    public function setType($type)
    {
        $this->type = $type;
    }

    /**
     * @return int
     */
    public function getCounter()
    {
        return $this->counter;
    }

    /**
     * @param int $counter
     */
    public function setCounter($counter)
    {
        $this->counter = $counter;
    }

    public function incrementCounter()
    {
        $this->counter++;
    }

    public function decrementCounter()
    {
        $this->counter--;
    }

    /**
     * Add vote
     *
     * @param \Bundle\CommonBundle\Entity\Vote\Vote $vote
     * @return Song
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
     * Get boolean
     *
     * @return hasCurrentUserVote
     */
    public function hasCurrentUserVote($id)
    {
        foreach($this->votes as $vote) {
            if($id === $vote->getAuthor()->getId()) {
                return true;
            }
        }

        return false;
    }

    /**
     * Set author
     * @param \Bundle\CommonBundle\Entity\User $author
     * @return Song
     */
    public function setAuthor(\Bundle\CommonBundle\Entity\User $author)
    {
        $this->author = $author;

        return $this;
    }

    /**
     * Get author
     * @return Song
     */
    public function getAuthor()
    {
        return $this->author;
    }

    /**
     * @return string
     */
    public function getArtist()
    {
        return $this->artist;
    }

    /**
     * @param string $artist
     */
    public function setArtist($artist)
    {
        $this->artist = $artist;
    }

    /**
     * @return int
     */
    public function getDuration()
    {
        return $this->duration;
    }

    /**
     * @param int $duration
     */
    public function setDuration($duration)
    {
        $this->duration = $duration;
    }

    /**
     * @return boolean
     */
    public function isDeleted()
    {
        return $this->deleted;
    }

    /**
     * @param boolean $deleted
     */
    public function setDeleted($deleted)
    {
        $this->deleted = $deleted;
    }
}
