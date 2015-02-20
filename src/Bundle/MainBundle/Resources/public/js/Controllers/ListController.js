(function() {
    "use strict";

    function ListController($rootScope, $scope, $modal, SongManager, UserManager, PlayerManager, Config) {
        var self    = this;

        this.onlyMy     = false;
        this.player     = new PlayerManager();
        this.songs      = {};
        this.user       = {};
        this.top        = false;

        $scope.$watchCollection(UserManager.getCurrentUser, function(data) {
            self.user = data;
        });

        $scope.$watchCollection(SongManager.getSongs, function(data) {
            self.songs = data;
        });

        this.nextBlock = function() {
            SongManager.getNextBlock();
        };
        this.vote = function (id, like) {
            SongManager.voteForSong(id, like);
        };
        this.delete = function (id) {
            SongManager.deleteSong(id);
        };
        this.isMy = function (id) {
            return SongManager.isMy(id);
        };
        this.getUser = function (id) {
            return UserManager.getUser(id);
        };
        this.play = function (id) {
            var state = self.player.getState(id);
            if(state && state.playing) {
                self.player.pause();
            } else {
                self.player.playById(id);
            }
        };
        this.open = function (id) {
            $modal.open({
                templateUrl: Config.Routing.whoVote.replace('_ID_', id)
            });
        };

        $rootScope.$on('song:add', function(event, data) {
            SongManager.addSong(data.id, data.song);
            $scope.$apply();
        });
        $rootScope.$on('song:remove', function(event, id) {
            SongManager.removeSong(id);
            $scope.$apply();
        });
        $rootScope.$on('song:update', function(event, data) {
            $rootScope.$broadcast('popup:show', {type: 'info', 'message': data.message});
            SongManager.updateCounter(data.id, data.count);
            $scope.$apply();
        });
    };

    angular.module('musicpoll').controller('ListController', ListController);
})();