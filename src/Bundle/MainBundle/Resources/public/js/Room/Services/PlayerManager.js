(function() {
    "use strict";

    function PlayerManager($rootScope, $document, $q, SongManager, Config, ApiService) {
        var PlayerManager = function(callbacks, isMainPLayer) {
            var player = $document[0].createElement('audio'),
                getDefaultState = function() {
                    return {
                        songId:     null,
                        playing:    false,
                        getSongId:  function() {
                            return this.songId;
                        },
                        isPlaying:  function() {
                            return this.playing;
                        },
                        setPlaying: function(playing) {
                            this.playing = playing;
                        }
                    };
                },
                state           = getDefaultState(),
                volumeLevel     = 1,
                setVolume = function(volume) {
                    if(angular.isNumber(volume)) {
                        volumeLevel = volume;
                    } else if(volume === true || volume === false) {
                        volumeLevel += volume ? 0.101 : -0.101;
                    }

                    volumeLevel     = volumeLevel > 1 ? 1 : volumeLevel < 0 ? 0 : volumeLevel;
                    player.volume   = volumeLevel;
                },
                setDefaultState = function() {
                    state = getDefaultState();
                },
                setTime = function (second) {
                    player.currentTime = second;
                },
                getPercent = function (currentTime, duration) {
                    currentTime = angular.isUndefined(currentTime)  ? (player.currentTime ? player.currentTime : 1) : currentTime;
                    duration    = angular.isUndefined(duration)     ? (player.duration ? player.duration : 2)       : duration;

                    return Math.round(currentTime / duration * 100);
                },
                sendPlay = function (playing) {
                    if(isMainPLayer) {
                        return ApiService.put(Config.ROUTING.play.replace('_TYPE_', playing));
                    } else {
                        var deferred = $q.defer();

                        deferred.resolve();
                        state.setPlaying(playing);

                        return deferred.promise;
                    }
                },
                pause = function () {
                    sendPlay(false).then(function() {
                        player.pause();
                    });
                },
                play = function () {
                    sendPlay(true).then(function() {
                        player.play();
                    });
                },
                getState = function (id) {
                    if(!angular.isUndefined(id)) {
                        if(state.songId != id) {
                            return getDefaultState();
                        }
                    }

                    return state;
                },
                playByUrl = function (url) {
                    if(!angular.equals(player.src, url)) {
                        player.src = url;
                    }
                    play();
                },
                playById = function (id) {
                    state.songId = id;
                    playByUrl(SongManager.getSong(state.songId).url);
                };

            player.addEventListener('offline',  (!angular.isUndefined(callbacks)    && angular.isFunction(callbacks['onoffline']))  ? callbacks['onoffline']    : function () { pause(); });
            player.addEventListener('online',   (!angular.isUndefined(callbacks)    && angular.isFunction(callbacks['ononline']))   ? callbacks['ononline']     : function () { play(); });
            player.addEventListener('ended',    (!angular.isUndefined(callbacks)    && angular.isFunction(callbacks['onended']))    ? callbacks['onended']      : function () { pause(); });
            player.addEventListener('error',    (!angular.isUndefined(callbacks)    && angular.isFunction(callbacks['onerror']))    ? callbacks['onerror']      : function () {});

            return {
                setDefaultState:    setDefaultState,
                getPercent:         getPercent,
                playByUrl:          playByUrl,
                setVolume:          setVolume,
                getState:           getState,
                playById:           playById,
                setTime:            setTime,
                pause:              pause,
                play:               play
            }
        };

        return PlayerManager;
    };

    angular.module('musicpoll').factory('PlayerManager', PlayerManager);
})();