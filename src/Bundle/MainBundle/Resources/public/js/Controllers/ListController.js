(function() {
    "use strict";

    function ListController($rootScope, $scope, ApiService, SongManager, Config, PlayerManager) {
        var self    = this;

        self.authorId   = '';
        self.onlyMy     = false;
        self.player     = PlayerManager;
        self.songs      = {};
        self.top        = false;

        $scope.$watch(SongManager.getSongs, function(data) {
            self.songs = data;
        });

        this.setId = function (id) {
            self.authorId = id != undefined ? id : Config.userId;
        };
        this.nextBlock = function() {
            SongManager.getNextBlock();
        };
        this.vote = function (id, like) {
            SongManager.voteForSong(id, like);
        };
        this.delete = function (id) {
            SongManager.deleteSong(id);
        };
        this.play = function (id) {
            var state = self.player.getState(id);
            if(state && state.playing) {
                self.player.pause();
            } else {
                self.player.playById(id);
            }
        };

        $rootScope.$on('song:add', function(event, data) {
            SongManager.addSong(data.id, data.song);
        });
        $rootScope.$on('song:remove', function(event, id) {
            SongManager.removeSong(id);
        });
        $rootScope.$on('song:update', function(event, data) {
            $rootScope.$broadcast('popup:show', {type: 'info', 'message': data.message});
            SongManager.updateCounter(data.id, data.count);
        });
    };

    angular.module('musicpoll').controller('ListController', ListController);
})();