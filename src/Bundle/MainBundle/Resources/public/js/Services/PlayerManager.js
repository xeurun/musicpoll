(function() {
    "use strict";

    function PlayerManager($document, $q, SongManager, Config, ApiService) {
        var PlayerManager = function(callbacks, isMainPLayer) {
            var player = $document[0].createElement('audio'),
                getDefaultState = function() {
                    return {
                        songId:     null,
                        isPlaying:  false
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
                    ApiService.put(Config.Routing.rewind.replace('_TIME_', second)).then(function() {
                        player.currentTime = second;
                    });
                },
                getPercent = function () {
                    return Math.round(player.currentTime / player.duration * 100);
                },
                changeStatusRequest = function () {
                    if(isMainPLayer) {
                        return ApiService.put(Config.Routing.pause.replace('_TYPE_', !state.isPlaying));
                    } else {
                        var deferred = $q.defer();
                        deferred.resolve();

                        return deferred.promise;
                    }
                },
                pause = function () {
                    changeStatusRequest().then(function() {
                        state.isPlaying = false;
                        player.pause();
                    });
                },
                play = function () {
                    changeStatusRequest().then(function() {
                        state.isPlaying = true;
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
                    playByUrl(SongManager.getSong(id).url);
                };

            player.addEventListener('offline', (!angular.isUndefined(callbacks) && angular.isFunction(callbacks['onoffline'])) ? callbacks['onoffline'] : function () { pause(); });
            player.addEventListener('online', (!angular.isUndefined(callbacks) && angular.isFunction(callbacks['ononline'])) ? callbacks['ononline']    : function () { play(); });
            player.addEventListener('ended', (!angular.isUndefined(callbacks) && angular.isFunction(callbacks['onended'])) ? callbacks['onended']       : function () {});
            player.addEventListener('error', (!angular.isUndefined(callbacks) && angular.isFunction(callbacks['onerror'])) ? callbacks['onerror']       : function () {});

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