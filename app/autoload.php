<?php

use Doctrine\Common\Annotations\AnnotationRegistry;
use Composer\Autoload\ClassLoader;

/**
 * @var ClassLoader $loader
 */
$loader = require __DIR__.'/../vendor/autoload.php';
$loader->add('LZAztec', __DIR__.'/../vendor/bundles');
$loader->addClassMap(array(
    'Dklab_' => __DIR__.'/../vendor/Dklab/Reaplexor/api/php',
));
AnnotationRegistry::registerLoader(array($loader, 'loadClass'));

return $loader;
