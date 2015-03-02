(function() {
    "use strict";

    function PlayerController($rootScope, $scope, $timeout, $interval, ApiService, PlayerManager, SongManager, Config) {
        var self = this,
            interval,
            duration    = 0,
            second      = 0;

        this.started    = false;
        this.percent    = 0;
        this.muted      = false;
        this.song       = null;

        this.changeTime = function ($event) {
            ApiService.put(Config.Routing.rewind.replace('_TIME_', angular.element($event.target).val()));
        };

        this.next = function () {
            if (angular.isObject(self.song)) {
                SongManager.deleteSong(self.song.id);
            }
            var song = SongManager.getTopSong();
            ApiService.put(Config.Routing.next, {
                id: song ? song.id : null,
                title: song ? song.title : null
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
            if(self.started && !self.song) {
                self.next();
            }
        });

        $scope.$on('song:rewind', function(event, data) {
            if(Config.player) {
                self.audio.setTime(data);
            }
            second          = data;
            self.percent    = self.audio.getPercent(second, duration);

            $scope.$apply();
        });

        $scope.$on('song:next', function(event, data) {
            self.song = SongManager.getSong(data.id);
            if(angular.isObject(self.song)) {
                self.started = true;
                self.song.disable();
                if(!Config.player) {
                    self.audio.setState('isPlaying', true);
                    $scope.$apply();
                } else {
                    self.audio.playById(self.song.id);
                }
                second      = 0;
                duration    = self.song.getDuration();
                $interval.cancel(interval);
                interval = $interval(function() {
                    if(self.audio.getState().isPlaying) {
                        self.percent = self.audio.getPercent(++second, duration);
                    }
                }, 1000);
                $rootScope.$broadcast('popup:show', {type: 'info', message: data.message});
            } else {
                self.audio.setDefaultState();
                self.audio.pause();
                $rootScope.$broadcast('popup:show', {type: 'danger', message: 'Плейлист пуст!'});
            }

            $scope.$apply();
        });

        $scope.$on('song:mute', function(event, data) {
            self.muted = data.on;
            self.audio.setVolume(self.muted ? 0.2 : 1);
            if(!self.muted) {
                $rootScope.$broadcast('popup:hide');
            }
            $rootScope.$broadcast('popup:show', {type: 'success', message: data.message, save: self.muted});

            $scope.$apply();
        });
    };

    angular.module('musicpoll').controller('PlayerController', PlayerController);
})();
