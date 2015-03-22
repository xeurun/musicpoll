(function() {
    "use strict";

    function PlayerController($rootScope, $scope, $timeout, $interval, UserManager, ApiService, PlayerManager, SongManager, Config) {
        var self = this,
            interval,
            timeout;

        this.started        = false;
        this.second         = 0;
        this.duration       = 0;
        this.muted          = false;
        this.song           = null;
        this.userManager    = UserManager;
        this.headphone      = false;
        this.skip           = false;
        this.skips          = [];

        this.changeTime = function () {
            if(Config.PLAYER) {
                $timeout.cancel(timeout);
                timeout = $timeout(function () {
                    ApiService.put(Config.ROUTING.rewind.replace('_TIME_', self.second));
                }, 250);
            }
        };

        this.next = function () {
            if(Config.PLAYER) {
                if (angular.isObject(self.song)) {
                    SongManager.deleteSong(self.song.getId(), true);
                }
                var song = SongManager.getTopSong();
                ApiService.put(Config.ROUTING.next.replace('_ID_', song ? song.getId() : null));
            }
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

        this.initState = function () {
            if(!Config.PLAYER) {
                ApiService.get(Config.ROUTING.state, {
                    user: Config.USERID,
                    room: Config.ROOM.ID
                });
            }
        };

        $scope.$on('user:getState', function(event, data) {
            if(Config.PLAYER) {
                var data = {
                    state: {
                        song: angular.isObject(self.song) ? self.song.getId() : null,
                        muted:      self.muted,
                        playing:    self.audio.getState().isPlaying(),
                        second:     self.second,
                        started:    self.started,
                        skip:       self.skips.indexOf(Config.USERID) >= 0
                    },
                    user: data
                };
                ApiService.put(Config.ROUTING.state, data);
            }
        });

        $scope.$on('user:setState', function(event, data) {
            self.muted      = data.state.muted;
            self.song       = SongManager.getSong(data.state.song);
            self.started    = data.state.started;
            self.second     = data.state.second;
            self.skip       = data.state.skip;
            self.audio.getState().setPlaying(data.state.playing);
            if(self.audio.getState().isPlaying()) {
                if(angular.isObject(self.song)) {
                    self.duration = self.song.getDuration();
                    self.song.disable();
                    if(self.headphone) {
                        self.audio.playById(self.song.id);
                    }
                    $interval.cancel(interval);
                    interval = $interval(function() {
                        ++self.second;
                    }, 1000);
                } else if(angular.isString(Config.ROOM.SETTINGS.RADIO)) {
                    if(self.headphone) {
                        self.audio.playByUrl(Config.ROOM.SETTINGS.RADIO);
                    }
                }
                $rootScope.$broadcast('popup:show', {
                    type: 'info',
                    message: 'Сейчас играет ' + (angular.isObject(self.song) ? self.song.title : 'радио')
                });
            }
            $scope.$apply();
        });

        this.headphoneMode = function () {
            if(self.headphone) {
                self.audio.pause(true);
            } else {
                if(angular.isObject(self.song)) {
                    self.audio.playById(self.song.getId());
                    self.audio.setTime(self.second);
                } else if(angular.isString(Config.ROOM.SETTINGS.RADIO)) {
                    self.audio.playByUrl(Config.ROOM.SETTINGS.RADIO);
                }
            }
            self.headphone = !self.headphone;
        };

        this.voteSkip = function () {
            ApiService.put(Config.ROUTING.skip);
            self.skip = true;
        };

        this.mute = function () {
            ApiService.put(Config.ROUTING.mute.replace('_TYPE_', !this.muted));
        };

        $scope.$on('room:next', function(event, data) {
            self.song = SongManager.getSong(data);
            self.skips.splice(0, self.skips.length);
            self.skip = false;
            var isSong = angular.isObject(self.song);
            if(isSong || angular.isString(Config.ROOM.SETTINGS.RADIO)) {
                self.started = true;
                if(!Config.PLAYER) {
                    self.audio.getState().setPlaying(true);
                }
                if(isSong) {
                    self.song.disable();
                    self.second = 0;
                    self.duration = self.song.getDuration();
                    $interval.cancel(interval);
                    interval = $interval(function () {
                        if (self.audio.getState().isPlaying()) {
                            ++self.second;
                        }
                    }, 1000);
                } else {
                    self.second = 0;
                    $interval.cancel(interval);
                }
                if(self.headphone || Config.PLAYER) {
                    if(isSong) {
                        self.audio.playById(self.song.getId());
                    } else {
                        self.audio.playByUrl(Config.ROOM.SETTINGS.RADIO);
                    }
                }
                $rootScope.$broadcast('popup:show', {
                    type: 'info',
                    message: 'Сейчас играет ' + (isSong ? self.song.getTitle() : 'радио')
                });
            } else {
                self.audio.pause();
                $rootScope.$broadcast('popup:show', {type: 'danger', message: 'Плейлист пуст!'});
                self.audio.setDefaultState();
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
            if(Config.PLAYER && self.started && !angular.isObject(self.song)) {
                self.next();
            }

            $scope.$apply();
        });


        $scope.$on('room:setting', function(event, data) {
            Config.ROOM.SETTINGS.SKIP = data.skip;
            Config.ROOM.SETTINGS.RADIO = data.radio;
            if(self.skips.length >= Config.ROOM.SETTINGS.SKIP) {
                if(Config.PLAYER && self.started) {
                    self.next();
                }
            } else {
                $rootScope.$broadcast('popup:show', {
                    type:       'info',
                    message:    'Владелец комнаты обновил настройки, голосов до пропуска: ' + (Config.ROOM.SETTINGS.SKIP - self.skips.length) + '!'
                });
                $scope.$apply();
            }
        });

        $scope.$on('room:skip', function(event, data) {
            if(self.skips.indexOf(data.id) < 0) {
                self.skips.push(data.id);
                if(self.skips.length >= Config.ROOM.SETTINGS.SKIP) {
                    if(Config.PLAYER) {
                        self.next();
                    }
                }

                $rootScope.$broadcast('popup:show', {
                    type:       'info',
                    message:    data.fullname + ' проголосовал за пропуск, осталось голосов : ' + (Config.ROOM.SETTINGS.SKIP - self.skips.length) + '!'
                });
            }

            $scope.$apply();
        });

        $scope.$on('room:rewind', function(event, data) {
            if(self.headphone || Config.PLAYER) {
                self.audio.setTime(data);
            }

            self.second = data;

            $scope.$apply();
        });

        $scope.$on('room:mute', function(event, data) {
            self.muted = data.on;
            if(Config.PLAYER) {
                self.audio.setVolume(self.muted ? 0.2 : 1);
            }
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

            if(self.headphone) {
                if(data) {
                    self.audio.play(true);
                } else {
                    self.audio.pause(true);
                }
            }

            $scope.$apply();
        });
    };

    angular.module('musicpoll').controller('PlayerController', PlayerController);
})();
