(function() {
    "use strict";

    function PlayerManager($rootScope) {
        var PlayerManager   = {},
            playing         = false,
            pause           = false,
            volume          = 1,
            player          = document.createElement('audio');

        PlayerManager.volume = function (up) {
            volume += up ? .1 : -.1;
            player.volume = volume > 1 ? 0.99 : volume < 0 ? 0 : volume;
        };

        PlayerManager.pause = function () {
            if(playing) {
                player.pause();
                pause = true;
            }
        };

        PlayerManager.getState = function () {
            return {
                playing: pause ? false : playing,
                pause: pause
            }
        };

        PlayerManager.setUrl = function (url) {
            player.src = url;
        };

        PlayerManager.playByUrl = function (url) {
            if(!angular.equals(player.src, url)) {
                this.setUrl(url);
            }
            this.play();
        };

        PlayerManager.play = function () {
            if(!playing || pause) {
                player.play();
                pause      = false;
                playing    = true;
            }
        };

        player.onoffline = function () { PlayerManager.pause(); };
        player.ononline = function () { PlayerManager.play(); };
        player.onended = function () {
            $rootScope.$broadcast('player:end');
        };
        player.onerror = function () {
            $rootScope.$broadcast('player:error');
        };

        return PlayerManager;
    };

    angular.module('musicpoll').factory('PlayerManager', PlayerManager);
})();