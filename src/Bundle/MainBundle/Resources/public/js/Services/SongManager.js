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

        SongManager.getSongs = function() {
            return self.songs;
        };

        SongManager.deleteSong = function(id) {
            ApiService.sendRequest(Config.Routing.remove.replace('_ID_', id), null, true)
                .success(function(response, status, headers, config) {
                    if (!response.error) {
                        SongManager.removeSong(id);
                    } else {
                        $rootScope.$broadcast('popup:show', {type: 'danger', 'message': response.error});
                    }
                });
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

        SongManager.voteForSong = function(id, like) {
            ApiService.sendRequest(Config.Routing.vote.replace('_ID_', id).replace('_CHOOSE_', like));
        };

        SongManager.addSong = function(id, song) {
            self.songs[id] = song;
        };

        SongManager.updateCounter = function(id, count) {
            self.songs[id].counter = count;
        };

        return SongManager;
    };

    angular.module('musicpoll').factory('SongManager', SongManager);
})();