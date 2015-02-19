(function() {
    "use strict";

    function SongManager($filter, ApiService, Config) {
        var SongManager = {},
            offset      = 0,
            self        = this;

        self.songs = {};

        SongManager.getNextBlock = function() {
            ApiService.get(Config.Routing.getPortion.replace('_OFFSET_', offset)).success(function(data){
                angular.forEach(data.entities, function(value, index) {
                    self.songs[index] = value;
                });
                offset += data.count;
            });
        };

        SongManager.getNextBlock();

        SongManager.getSongs = function(id) {
            return self.songs;
        };

        SongManager.popSong = function(id) {
            var song = self.songs[id];

            delete self.songs[id];

            return song;
        };

        SongManager.deleteSong = function(id) {
            ApiService.sendRequest(Config.Routing.remove.replace('_ID_', id));
        };

        SongManager.removeSong = function(key) {
            delete self.songs[key];
        };

        SongManager.getTopSong = function() {
            if(!Object.keys(self.songs).length > 0) {
                return null;
            }

            return $filter('orderObjectBy')(self.songs, 'counter', true)[0];
        };

        SongManager.getSong = function(id) {
            return self.songs[id];
        };

        SongManager.addSong = function(id, data) {
            self.songs[id] = data;
        };

        SongManager.updateCounter = function(id, count) {
            self.songs[id].counter = count;
        };

        return SongManager;
    };

    angular.module('musicpoll').factory('SongManager', SongManager);
})();