(function() {
    "use strict";

    function PlayerController($rootScope, $scope, ApiService, SongManager, Config) {
        var self    = this,
            player  = document.createElement('audio');

        this.muted      = false;
        this.playing    = null;
        this.song       = false;
        this.volume     = 1;

        function init(url) {
            player.src = url;
            player.play();
            player.volume = self.volume;
            self.playing = true;
        };

        this.play = function () {
            if(self.playing) {
                player.pause();
            } else {
                player.play();
            }

            self.playing = !self.playing;
        };

        this.setVolume = function (value) {
            if(value) {
                self.volume += .1;
            } else {
                self.volume -= .1;
            }
            self.volume = self.volume > 1 ? 1 : self.volume < 0 ? 0 : self.volume;
            console.log(self.volume);
            player.volume = self.volume;
        };

        player.onoffline = function () {
            self.playing = false;
            self.play();
        };

        player.ononline = function () {
            self.playing = true;
            self.play();
        };

        player.onended = player.onerror = this.next = function () {
            self.song = SongManager.getTopSong();
            if (self.song != null) {
                init(self.song.url);
                SongManager.deleteSong(self.song.id);
            }
        };

        $rootScope.$on('song:mute', function(event, data) {
            self.muted = data == 'false' ? false : true;
            console.log(self.muted);
            self.volume = self.muted ? 0.2 : 1;
            player.volume = self.volume;
            $scope.$apply();
        });

        this.mute = function () {
            ApiService.sendRequest(Config.Routing.mute.replace('_TYPE_', !this.muted));
        };
    };

    angular.module('musicpoll').controller('PlayerController', PlayerController);
})();