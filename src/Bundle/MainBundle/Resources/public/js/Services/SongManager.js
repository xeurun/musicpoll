(function() {
    "use strict";

    function SongManager($filter, ApiService, Config, UserManager) {
        var offset          = 0,
            songs           = {},
            songPrototype   = {
                disable: function() {
                    this.disabled = true;
                },
                getDuration: function() {
                    return this.duration;
                },
                getAuthor: function() {
                    return UserManager.getUser(this.authorId);
                },
                updateCounter: function(count) {
                    this.counter = count;
                },
                isMy: function() {
                    return this.authorId === Config.userId
                },
                vote: function() {
                    this.voted = true;
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

            var temp    = $filter('orderObjectBy')(songs, 'counter', false),
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
            ApiService.put(Config.Routing.vote.replace('_ID_', id).replace('_CHOOSE_', like));
        };

        this.addSong = function(id, song) {
            songs[id] = angular.extend(song, songPrototype);;
        };
    };

    angular.module('musicpoll').service('SongManager', SongManager);
})();