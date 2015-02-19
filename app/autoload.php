<?php

use Doctrine\Common\Annotations\AnnotationRegistry;
use Composer\Autoload\ClassLoader;

/**
 * @var ClassLoader $loader
 */
$loader = require __DIR__.'/../vendor/autoload.php';
$loader->addClassMap(array(
    'Dklab_' => __DIR__.'/../src/vendor',
));
AnnotationRegistry::registerLoader(array($loader, 'loadClass'));

return $loader;
