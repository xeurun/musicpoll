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
     * @ORM\JoinColumn(nullable=true, name="authorId", referencedColumnName="id", onDelete="CASCADE", nullable=false)
     */
    private $author;

    /**
     * @param \Bundle\CommonBundle\Entity\Song\Song $song
     * @param \Bundle\CommonBundle\Entity\User $author
     */
    public function __construct($song, $author)
    {
        $this->song = $song;
        $this->author = $author;
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
     */
    public function setId($id)
    {
        $this->id = $id;
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
     */
    public function setSong($song)
    {
        $this->song = $song;
    }

    /**
     * Set author
     * @param \Bundle\CommonBundle\Entity\User $author
     * @return $this
     */
    public function setAuthor(\Bundle\CommonBundle\Entity\User $author)
    {
        $this->author = $author;

        return $this;
    }

    /**
     * Get author
     * @return User
     */
    public function getAuthor()
    {
        return $this->author;
    }
}
