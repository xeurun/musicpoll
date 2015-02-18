<?php
namespace Bundle\CommonBundle\Entity;

trait AuthorTrait
{
    /**
     * Идентификатор автора
     * @ORM\ManyToOne(targetEntity="Bundle\CommonBundle\Entity\User", fetch="EAGER")
     * @ORM\JoinColumn(nullable=true, name="authorId", referencedColumnName="id")
     */
    private $author;

    /**
     * Set author
     * @param User $author
     * @return $this
     */
    public function setAuthor(User $author)
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
