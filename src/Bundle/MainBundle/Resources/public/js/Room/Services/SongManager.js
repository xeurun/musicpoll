(function() {
    "use strict";

    function SongManager($filter, ApiService, Config, Song) {
        var offset          = 0,
            songs           = {};

        this.getNextBlock = function() {
            ApiService.get(Config.ROUTING.getPortion.replace('_OFFSET_', offset)).then(function(data) {
                angular.forEach(data.entities, function(value, index) {
                    songs[index] = new Song(value);
                });
                offset += data.count;
            });
        };

        this.getSongs = function() {
            return songs;
        };

        this.deleteSong = function(id, system) {
            ApiService.delete(Config.ROUTING.remove.replace('_ID_', id), {
                system: system || false
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
                if(!value.isDisabled()) {
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
            songs[id] = new Song(song);
        };
    };

    angular.module('musicpoll').service('SongManager', SongManager);
})();
