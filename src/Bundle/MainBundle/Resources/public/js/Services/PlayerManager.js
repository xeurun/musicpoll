(function() {
    "use strict";

    function PlayerManager(SongManager) {
        var PlayerManager = function(callbacks) {
            var songId          = null,
                isPause         = false,
                player          = document.createElement('audio'),
                isPlaying       = false,
                volumeLevel     = 1,
                volume = function (up) {
                    volumeLevel += up ? .1 : -.1;
                    player.volume = volumeLevel > 1 ? 0.99 : volumeLevel < 0 ? 0 : volumeLevel;
                },
                setVolume = function (volume) {
                    volumeLevel = volume;
                    player.volume = volume;
                },
                getSongId = function () {
                    return songId;
                },
                clear = function() {
                    songId      = null;
                    isPause     = false;
                    isPlaying   = false;
                },
                getPercent = function () {
                    return Math.round(player.currentTime / player.duration * 100);
                },
                getState = function (id) {
                    if(!angular.isUndefined(id)) {
                        if(songId != id) {
                            return {
                                playing: false,
                                pause: false,
                                id: null
                            }
                        }
                    }

                    return {
                        playing: isPause ? false : isPlaying,
                        pause: isPause,
                        id: songId
                    }
                },
                playById = function (id) {
                    var song = SongManager.getSong(id);
                    songId = song.id;

                    this.playByUrl(song.url);
                },
                playByUrl = function (url) {
                    if(!angular.equals(player.src, url)) {
                        player.src = url;
                    }
                    this.play();
                },
                pause = function () {
                    isPause = true;
                    player.pause();
                },
                play = function () {
                    isPause     = false;
                    isPlaying   = true;
                    player.play();
                };

            player.onoffline    = (callbacks != undefined && angular.isFunction(callbacks['onoffline'])) ? callbacks['onoffline'] : function () { pause(); };
            player.ononline     = (callbacks != undefined && angular.isFunction(callbacks['ononline'])) ? callbacks['ononline'] : function () { play(); };
            player.onended      = (callbacks != undefined && angular.isFunction(callbacks['onended'])) ? callbacks['onended'] : function () {};
            player.onerror      = (callbacks != undefined && angular.isFunction(callbacks['onerror'])) ? callbacks['onerror'] : function () {};

            return {
                getPercent: getPercent,
                getSongId:  getSongId,
                playByUrl:  playByUrl,
                setVolume:  setVolume,
                getState:   getState,
                playById:   playById,
                volume:     volume,
                pause:      pause,
                clear:      clear,
                play:       play
            }
        };

        return PlayerManager;
    };

    angular.module('musicpoll').factory('PlayerManager', PlayerManager);
})();