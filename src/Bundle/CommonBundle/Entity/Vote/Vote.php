<?php

namespace Bundle\CommonBundle\Entity\Vote;

use Bundle\CommonBundle\Entity\BaseEntity;
use Doctrine\ORM\Mapping as ORM;

/**
 * Song
 *
 * @ORM\Table()
 * @ORM\Entity(repositoryClass="Bundle\CommonBundle\Entity\Vote\VoteRepository")
 */
class Vote extends BaseEntity
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
     * @ORM\ManyToOne(targetEntity="Bundle\CommonBundle\Entity\Song\Song", inversedBy="votes", cascade={"persist"})
     * @ORM\JoinColumn(name="songId", referencedColumnName="id", onDelete="CASCADE", nullable=false)
     **/
    private $song;

    /**
     * Идентификатор автора
     * @ORM\ManyToOne(targetEntity="Bundle\CommonBundle\Entity\User", inversedBy="votes", cascade={"persist"})
     * @ORM\JoinColumn(name="authorId", referencedColumnName="id", onDelete="SET NULL", nullable=true)
     */
    private $author;

    /**
     * @var boolean
     *
     * @ORM\Column(name="dislike", type="boolean", options={"default": false})
     */
    private $dislike = false;

    /**
     * @param \Bundle\CommonBundle\Entity\Song\Song $song
     * @param boolean $choose
     */
    public function __construct($song, $choose)
    {
        $this->song = $song;
        $this->dislike = $choose;
    }

    /**
     * @return int
     */
    public function getId()
    {
        return $this->id;
    }

    /**
     * @param int $id
     *
     * @return Vote
     */
    public function setId($id)
    {
        $this->id = $id;

        return $this;
    }

    /**
     * @return \Bundle\CommonBundle\Entity\Song\Song
     */
    public function getSong()
    {
        return $this->song;
    }

    /**
     * @param \Bundle\CommonBundle\Entity\Song\Song $song
     *
     * @return Vote
     */
    public function setSong($song)
    {
        $this->song = $song;

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
     * @param \Bundle\CommonBundle\Entity\User $author
     *
     * @return Vote
     */
    public function setAuthor(\Bundle\CommonBundle\Entity\User $author)
    {
        $this->author = $author;

        return $this;
    }

    /**
     * @return boolean
     */
    public function isDislike()
    {
        return $this->dislike;
    }

    /**
     * @param boolean $dislike
     *
     * @return Vote
     */
    public function setDislike($dislike)
    {
        $this->dislike = $dislike;

        return $this;
    }
}
