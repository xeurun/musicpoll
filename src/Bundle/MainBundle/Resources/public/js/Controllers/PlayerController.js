(function() {
    "use strict";

    function PlayerController($rootScope, $scope, $interval, ApiService, PlayerManager, SongManager, Config) {
        var self = this,
            interval,
            duration    = 0,
            second      = 0,
            play        = true;

        this.started    = false;
        this.percent    = 0;
        this.muted      = false;
        this.song       = null;

        this.changeTime = function ($event) {
            self.audio.setTime(angular.element($event.target).val());
            self.percent = self.audio.getPercent();
        };

        this.next = function () {
            if (angular.isObject(self.song)) {
                SongManager.deleteSong(self.song.id);
            }
            self.song = SongManager.getTopSong();
            if(angular.isObject(self.song)) {
                self.started = true;
                self.audio.playById(self.song.id);
            } else {
                self.audio.setDefaultState();
                self.audio.pause();
                $rootScope.$broadcast('popup:show', {type: 'danger', message: 'Плейлист пуст!'});
            }
            ApiService.put(Config.Routing.next, {
                id: self.song ? self.song.id : null,
                title: self.song ? self.song.title : null
            });
        };

        this.audio = new PlayerManager(
            {
                onerror: this.next,
                onended: this.next
            },
            true
        );

        this.play = function () {
            if(!self.audio.getState().isPlaying) {
                self.audio.play();
            } else {
                self.audio.pause();
            }
        };

        this.mute = function () {
            ApiService.put(Config.Routing.mute.replace('_TYPE_', !this.muted));
        };

        $scope.$on('song:add', function(event, data) {
            SongManager.addSong(data.id, data.song);
            $scope.$apply();
            if(self.started && !self.song) {
                self.next();
            }
        });

        $scope.$on('song:rewind', function(event, data) {
            $scope.$apply(second = data);
        });

        $scope.$on('song:pause', function(event, data) {
            play = data;
        });

        $scope.$on('song:next', function(event, data) {
            self.song = SongManager.getSong(data.id);
            if(angular.isObject(self.song)) {
                self.song.disable();
                if(!Config.player) {
                    $scope.$apply(self.started = true);
                    second      = 0;
                    duration    = self.song.getDuration();
                    play        = true;
                }
                $interval.cancel(interval);
                interval = $interval(function() {
                    if(play && self.percent < 100) {
                        if(Config.player) {
                            self.percent = self.audio.getPercent();
                        } else {
                            self.percent = Math.round(++second / duration * 100);
                        }
                    }
                }, 1000);
                $rootScope.$broadcast('popup:show', {type: 'info', message: data.message});
            }
            $scope.$apply();
        });

        $scope.$on('song:mute', function(event, data) {
            self.muted = data.on;
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