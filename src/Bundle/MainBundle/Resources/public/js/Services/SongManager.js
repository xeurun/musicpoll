(function() {
    "use strict";

    function SongManager($filter, ApiService, Config, UserManager) {
        var offset      = 0,
            songs       = {};

        this.getNextBlock = function() {
            ApiService.get(Config.Routing.getPortion.replace('_OFFSET_', offset)).success(function(data){
                angular.forEach(data.entities, function(value, index) {
                    songs[index] = value;
                });
                offset += data.count;
            });
        };

        this.getNextBlock();

        this.getSongs = function() {
            return songs;
        };

        this.deleteSong = function(id) {
            this.removeSong(id);
            ApiService.sendRequest(Config.Routing.remove.replace('_ID_', id));
        };

        this.removeSong = function(key) {
            delete songs[key];
        };

        this.getTopSong = function() {
            if(!Object.keys(songs).length) {
                return null;
            }

            return $filter('orderObjectBy')(songs, 'counter', true)[0];
        };

        this.getSong = function(id) {
            return songs[id];
        };

        this.voteForSong = function(id, like) {
            ApiService.sendRequest(Config.Routing.vote.replace('_ID_', id).replace('_CHOOSE_', like));
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

        this.disable = function(id) {
            songs[id].disabled = true;
        };

        this.updateCounter = function(id, count) {
            songs[id].counter = count;
        };
    };

    angular.module('musicpoll').service('SongManager', SongManager);
})();