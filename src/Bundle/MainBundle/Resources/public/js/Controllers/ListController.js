(function() {
    "use strict";

    function ListController($rootScope, $scope, $modal, SongManager, UserManager, PlayerManager, Config) {
        var self = this;

        this.songManager    = SongManager;
        this.userManager    = UserManager;
        this.player         = new PlayerManager();
        this.onlyMy         = false;
        this.top            = false;

        this.play = function (id) {
            if(!self.player.getState(id).isPlaying) {
                self.player.playById(id);
            } else {
                self.player.pause();
            }
        };
        this.open = function (id) {
            $modal.open({
                templateUrl: Config.Routing.whoVote.replace('_ID_', id)
            });
        };

        $scope.$on('song:remove', function(event, id) {
            SongManager.removeSong(id);

            $scope.$apply();
        });
        $scope.$on('song:update', function(event, data) {
            $rootScope.$broadcast('popup:show', {type: 'info', 'message': data.message});
            SongManager.getSong(data.id).vote();
            SongManager.getSong(data.id).updateCounter(data.count);

            $scope.$apply();
        });
    };

    angular.module('musicpoll').controller('ListController', ListController);
})();