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

        this.setVolume = function (up) {
            self.volume += up ? .1 : -.1;
            player.volume = self.volume > 1 ? 1 : self.volume < 0 ? 0 : self.volume;
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
            if (self.song != false && self.song != null) {
                SongManager.deleteSong(self.song.id);
            }
            self.song = SongManager.getTopSong();
            if(self.song != null) {
                init(self.song.url);
                self.song.disabled = true;
                ApiService.sendRequest(Config.Routing.next, {
                    id: self.song.id,
                    title: self.song.title
                });
            } else {
                $rootScope.$broadcast('popup:show', {type: 'danger', message: 'Плейлист пуст!'});
                if(self.playing) {
                    this.play();
                }
                self.playing = null;
            }
            console.log(self.song);
        };

        $rootScope.$on('song:next', function(event, data) {
            self.song = SongManager.getSong(data.id);
            if(self.song) {
                self.song.title = data.title;
                $rootScope.$broadcast('popup:show', {type: 'info', message: data.message});
                $scope.$apply();
            }
        });

        $rootScope.$on('song:mute', function(event, data) {
            self.muted = data == 'false' ? false : true;
            self.volume = self.muted ? 0.2 : 1;
            player.volume = self.volume;
            if(!self.muted) {
                $rootScope.$broadcast('popup:hide');
            }
        });

        this.mute = function () {
            ApiService.sendRequest(Config.Routing.mute.replace('_TYPE_', !this.muted), null, false, !this.muted);
        };
    };

    angular.module('musicpoll').controller('PlayerController', PlayerController);
})();