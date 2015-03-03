(function() {
    "use strict";

    function PlayerController($rootScope, $scope, $interval, UserManager, ApiService, PlayerManager, SongManager, Config) {
        var self = this,
            interval,
            duration    = 0,
            second      = 0;

        this.started        = false;
        this.percent        = 0;
        this.muted          = false;
        this.song           = null;
        this.userManager    = UserManager;

        this.changeTime = function ($event) {
            ApiService.put(Config.ROUTING.rewind.replace('_TIME_', angular.element($event.target).val()));
        };

        this.next = function () {
            if (angular.isObject(self.song)) {
                SongManager.deleteSong(self.song.id);
            }
            var song = SongManager.getTopSong();
            ApiService.put(Config.ROUTING.next.replace('_ID_', song ? song.id : null));
        };

        this.audio = new PlayerManager(
            {
                onerror: this.next,
                onended: this.next
            },
            Config.PLAYER
        );

        this.play = function () {
            if(!self.audio.getState().isPlaying()) {
                self.audio.play();
            } else {
                self.audio.pause();
            }
        };

        this.mute = function () {
            ApiService.put(Config.ROUTING.mute.replace('_TYPE_', !this.muted));
        };

        $scope.$on('room:next', function(event, data) {
            self.song = SongManager.getSong(data);
            if(angular.isObject(self.song)) {
                self.started = true;
                self.song.disable();
                if(!Config.PLAYER) {
                    self.audio.getState().setPlaying(true);
                } else {
                    self.audio.playById(self.song.id);
                }
                second      = 0;
                duration    = self.song.getDuration();
                $interval.cancel(interval);
                interval = $interval(function() {
                    if(self.audio.getState().isPlaying()) {
                        self.percent = self.audio.getPercent(++second, duration);
                    }
                }, 1000);
                $rootScope.$broadcast('popup:show', {
                    type: 'info',
                    message: 'Сейчас играет ' + self.song.title
                });
            } else {
                self.audio.pause();
                self.audio.setDefaultState();
                $rootScope.$broadcast('popup:show', {type: 'danger', message: 'Плейлист пуст!'});
            }

            $scope.$apply();
        });

        $scope.$on('room:add', function(event, data) {
            SongManager.addSong(data.id, data.song);
            var song = SongManager.getSong(data.id);
            $rootScope.$broadcast('popup:show', {
                type: 'success',
                message: (angular.isObject(song) ? (song.getAuthor().getFullname() + ' добавил ') : 'Добавлена ') + data.song.title
            });
            if(Config.PLAYER && self.started && !self.song) {
                self.next();
            }

            $scope.$apply();
        });

        $scope.$on('room:rewind', function(event, data) {
            if(Config.PLAYER) {
                self.audio.setTime(data);
            }
            second          = data;
            self.percent    = self.audio.getPercent(second, duration);

            $scope.$apply();
        });

        $scope.$on('room:state', function(event, data) {
            if(Config.PLAYER) {
                //TODO: send status data
            }
        });

        $scope.$on('room:mute', function(event, data) {
            self.muted = data.on;
            self.audio.setVolume(self.muted ? 0.2 : 1);
            if(!self.muted) {
                $rootScope.$broadcast('popup:hide');
            }
            $rootScope.$broadcast('popup:show', {
                type:       'success',
                save:       self.muted,
                message:    data.author + (self.muted ? ' убавил ' : ' восстановил ') + 'звук!'
            });

            $scope.$apply();
        });

        $scope.$on('room:play', function(event, data) {
            self.audio.getState().setPlaying(data);

            $scope.$apply();
        });
    };

    angular.module('musicpoll').controller('PlayerController', PlayerController);
})();
