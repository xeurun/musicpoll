(function() {
    "use strict";

    function SongManager($filter, ApiService, Config, UserManager) {
        var offset  = 0,
            songs   = {},
            songPrototype   = {
                disable: function() {
                    this.disabled = true;
                },
                getDuration: function() {
                    return this.duration;
                }
            };

        this.getNextBlock = function() {
            ApiService.get(Config.Routing.getPortion.replace('_OFFSET_', offset)).then(function(data) {
                angular.forEach(data.entities, function(value, index) {
                    songs[index] = angular.extend(value, songPrototype);
                });
                offset += data.count;
            });
        };

        this.getSongs = function() {
            return songs;
        };

        this.deleteSong = function(id) {
            var self = this;
            ApiService.delete(Config.Routing.remove.replace('_ID_', id)).then(function() {
                self.removeSong(id);
            });
        };

        this.removeSong = function(id) {
            delete songs[id];
        };

        this.getTopSong = function() {
            if(!Object.keys(songs).length) {
                return null;
            }

            var temp    = $filter('orderObjectBy')(songs, 'counter', true),
                result  = null;

            angular.forEach(temp, function(value, index) {
                if(angular.isUndefined(value.disabled) || !value.disabled) {
                    result = value;

                    return;
                }
            });

            return result;
        };

        this.getSong = function(id) {
            if(!angular.isNumber(id)) return null;

            return songs[id];
        };

        this.voteForSong = function(id, like) {
            ApiService.put(Config.Routing.vote.replace('_ID_', id).replace('_CHOOSE_', like)).then(function() {
                songs[id].voted = true;
            });
        };

        this.addSong = function(id, song) {
            songs[id] = song;
        };

        this.isMy = function(id) {
            return songs[id].authorId === Config.userId;
        };

        this.getAuthor = function(id) {
            return UserManager.getUser(songs[id].authorId);
        };

        this.updateCounter = function(id, count) {
            songs[id].counter = count;
        };
    };

    angular.module('musicpoll').service('SongManager', SongManager);
})();