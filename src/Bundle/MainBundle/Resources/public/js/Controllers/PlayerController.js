(function() {
    "use strict";

    function PlayerController($rootScope, $scope, ApiService, PlayerManager, SongManager, Config) {
        var self = this;
        this.muted  = false;
        this.song   = null;

        this.next = function () {
            if (angular.isObject(self.song)) {
                SongManager.deleteSong(self.song.id);
            }
            self.song = SongManager.getTopSong();
            if(angular.isObject(self.song)) {
                self.audio.playById(self.song.id);
                ApiService.sendRequest(Config.Routing.next, {
                    id: self.song.id,
                    title: self.song.title
                });
            } else {
                self.audio.clear();
                self.audio.pause();
                $rootScope.$broadcast('popup:show', {type: 'danger', message: 'Плейлист пуст!'});
            }
        };

        this.audio  = new PlayerManager(
            {
                onerror: this.next,
                onended: this.next
            }
        );

        this.play = function () {
            if(!self.audio.getState().playing) {
                self.audio.play();
            } else {
                self.audio.pause();
            }
        };

        this.mute = function () {
            ApiService.sendRequest(Config.Routing.mute.replace('_TYPE_', !this.muted), null, false, !this.muted);
        };

        $rootScope.$on('song:next', function(event, data) {
            self.song = SongManager.getSong(data.id);
            if(angular.isObject(self.song)) {
                SongManager.disable(self.song.id);
                SongManager.updateCounter(self.song.id, 100000);
                $rootScope.$broadcast('popup:show', {type: 'info', message: data.message});
            }
            $scope.$apply();
        });

        $rootScope.$on('song:mute', function(event, data) {
            self.muted = data.on != 'false';
            self.audio.setVolume(self.muted ? 0.2 : 1);
            if(self.muted) {
                $rootScope.$broadcast('popup:show', {type: 'success', message: data.message, save: true});
            } else {
                $rootScope.$broadcast('popup:hide');
                $rootScope.$broadcast('popup:show', {type: 'success', message: data.message, save: false});
            }
            $scope.$apply();
        });
    };

    angular.module('musicpoll').controller('PlayerController', PlayerController);
})();