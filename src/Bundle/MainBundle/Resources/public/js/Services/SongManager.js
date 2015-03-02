(function() {
    "use strict";

    function SongManager($filter, ApiService, Config, UserManager) {
        var offset          = 0,
            songs           = {},
            songPrototype   = {
                getId: function() {
                    return this.id;
                },
                disable: function() {
                    this.disabled = true;
                },
                getDuration: function() {
                    return this.duration;
                },
                getTitle: function() {
                    return this.title;
                },
                getArtist: function() {
                    return this.artist;
                },
                getAuthor: function() {
                    return UserManager.getUser(this.authorId);
                },
                isDisabled: function() {
                    return this.disabled;
                },
                updateCounter: function(count) {
                    this.counter = count;
                },
                isMy: function() {
                    return this.authorId === Config.USERID
                },
                vote: function() {
                    this.voted = true;
                }
            };

        this.getNextBlock = function() {
            ApiService.get(Config.ROUTING.getPortion.replace('_OFFSET_', offset)).then(function(data) {
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
            ApiService.delete(Config.ROUTING.remove.replace('_ID_', id));
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
            return songs[id];
        };

        this.voteForSong = function(id, like) {
            ApiService.put(Config.ROUTING.vote.replace('_ID_', id).replace('_CHOOSE_', like));
        };

        this.addSong = function(id, song) {
            songs[id] = angular.extend(song, songPrototype);;
        };
    };

    angular.module('musicpoll').service('SongManager', SongManager);
})();
