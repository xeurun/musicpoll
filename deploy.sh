read environment

php app/console cache:clear --env=${environment}
php app/console assets:install --env=${environment} --symlink
php app/console assetic:dump --env=${environment} --no-debug
#chown www-data:www-data -R . 
chmod 777 -R ./app/cache
chmod 777 -R ./app/logs
