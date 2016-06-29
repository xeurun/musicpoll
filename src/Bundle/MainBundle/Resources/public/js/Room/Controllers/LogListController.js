(function() {
    "use strict";

    function LogListController($scope, $window, SongManager, PlayerManager) {
        var self = this;

        this.show       = false;
        this.songs      = {};
        this.searchText = '';
        this.player     = new PlayerManager();

        this.init = function() {
            self.songs = SongManager.getLogSongs();
        };

        this.refreshSongs = function (id, type) {
            self.songs = SongManager.getLogSongs(self.searchText);
        };

        this.addAgain = function (id) {
            alert('Скоро будет');
        };

        this.addTo = function (id, type) {
            var song = self.songs[id];
            if (type === 'vk' && song !== null) {
                $window.open('https://new.vk.com/search?c%5Bq%5D=' + song.getTitle() + '&c%5Bsection%5D=audio', '_blank')
            }
        };
    }

    angular.module('musicpoll').controller('LogListController', LogListController);
})();