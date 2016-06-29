<?php

namespace Bundle\CommonBundle\Form\Song;

use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolverInterface;

class SongType extends AbstractType
{
    /**
     * @param FormBuilderInterface $builder
     * @param array $options
     */
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder->add('title', 'text', array(
            'label' => false,
            'required' => true,
            'attr' => array(
                'ng-model'      => "form.song.title",
                'class'         => 'form-control' ,
                'placeholder'   => 'song.placeholder.title'
            ),
        ));

        $builder->add('url', 'text', array(
            'label' => false,
            'required' => true,
            'attr' => array(
                'ng-model'      => 'form.song.url',
                'class'         => 'form-control' ,
                'placeholder'   => 'song.placeholder.url'
            ),
        ));
        
        $builder->add('type', 'text', array(
            'required' => true,
            'label' => 'group.label.closed',
        ));

        $builder->add('artist', 'text', array(
            'required' => false,
            'attr' => array(
                'class' => 'hidden'
            ),
        ));

        $builder->add('duration', 'text', array(
            'required' => false,
            'attr' => array(
                'class' => 'hidden'
            ),
        ));

        $builder->add('sourceId', 'text', array(
            'required' => false,
            'attr' => array(
                'class' => 'hidden'
            ),
        ));

        $builder->add('genreId', 'text', array(
            'required' => false,
            'attr' => array(
                'class' => 'hidden'
            ),
        ));
    }
    
    /**
     * @param OptionsResolverInterface $resolver
     */
    public function setDefaultOptions(OptionsResolverInterface $resolver)
    {
        $resolver->setDefaults(array(
            'data_class' => 'Bundle\CommonBundle\Entity\Song\Song',
            'translation_domain' => 'form',
            'csrf_protection' => false,
        ));
    }

    /**
     * @return string
     */
    public function getName()
    {
        return 'song';
    }
}
