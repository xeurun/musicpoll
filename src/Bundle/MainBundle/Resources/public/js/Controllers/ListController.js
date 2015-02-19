(function() {
    "use strict";

    function ListController($rootScope, $scope, ApiService, SongManager, Config) {
        var self    = this;

        self.authorId   = '';
        self.onlyMy     = false;
        self.songs      = {};
        self.top        = false;

        $scope.$watch(SongManager.getSongs, function(data) {
            self.songs = data;
        });

        this.setId = function () {
            self.authorId = Config.userId;
        };

        this.nextBlock = function() {
            SongManager.getNextBlock();
        };

        this.like = function (id) {
            ApiService.sendRequest(Config.Routing.vote.replace('_ID_', id).replace('_CHOOSE_', true));
        };
        this.dislike = function (id) {
            ApiService.sendRequest(Config.Routing.vote.replace('_ID_', id).replace('_CHOOSE_', false));
        };
        this.remove = function (id) {
            SongManager.deleteSong(id);
        };

        $rootScope.$on('song:add', function(event, data) {
            SongManager.addSong(data.id, data.song);
        });
        $rootScope.$on('song:update', function(event, data) {
            SongManager.updateCounter(data.id, data.count);
        });
        $rootScope.$on('song:remove', function(event, id) {
            SongManager.removeSong(id);
        });
    };

    angular.module('musicpoll').controller('ListController', ListController);
})();