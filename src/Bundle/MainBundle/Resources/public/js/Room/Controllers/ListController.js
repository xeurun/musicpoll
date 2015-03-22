(function() {
    "use strict";

    function ListController($rootScope, $scope, $modal, $templateCache, SongManager, UserManager, PlayerManager, Config) {
        var self = this;

        this.songManager    = SongManager;
        this.userManager    = UserManager;
        this.player         = new PlayerManager();
        this.onlyMy         = false;
        this.top            = false;

        this.play = function (id) {
            if(!self.player.getState(id).isPlaying()) {
                self.player.playById(id);
            } else {
                self.player.pause();
            }
        };

        this.open = function (id) {
            var url = Config.ROUTING.whoVote.replace('_ID_', id);
            $modal.open({
                templateUrl: url
            }).result.then(function () {}, function () {
                $templateCache.remove(url);
            });
        };

        $scope.$on('room:remove', function(event, data) {
            var song = SongManager.getSong(data.id);
            if(angular.isObject(song)) {
                if(angular.isUndefined(data.system) || !data.system) {
                    $rootScope.$broadcast('popup:show', {
                        type: 'success',
                        message: data.author + ' удалил ' + song.getTitle()
                    });
                }
                if(self.player.getState(data.id).isPlaying()) {
                    self.player.pause();
                }
                SongManager.removeSong(data.id);
            }

            $scope.$apply();
        });
        $scope.$on('room:update', function(event, data) {
            var song = SongManager.getSong(data.id);
            if(angular.isObject(song)) {
                var user = UserManager.getUser(data.authorId);
                $rootScope.$broadcast('popup:show', {
                    type: 'info',
                    message: data.author + ' проголосовал ' + (data.dislike ? 'против ' : 'за ') + song.getTitle()
                });
                song.updateCounter(data.count);
                if(angular.isObject(user) && user.isCurrent()) {
                    song.vote();
                }
            }

            $scope.$apply();
        });
    };

    angular.module('musicpoll').controller('ListController', ListController);
})();
