(function() {
    "use strict";

    function ListController($rootScope, $scope, ApiService, SongManager, Config) {
        var self    = this,
            player  = document.createElement('audio');

        self.authorId   = '';
        self.playing    = {};
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
        this.play = function (id) {
            if(self.playing[id] === undefined) {
                self.playing[id] = false;
            }
            angular.forEach(self.playing, function(value, index) {
                if(index != id) {
                    self.playing[index] = false;
                }
            });
            if(self.playing[id]) {
                player.pause();
            } else {
                player.src = self.songs[id].url;
                player.play();
            }

            self.playing[id] = !self.playing[id];
        };

        $rootScope.$on('song:add', function(event, data) {
            SongManager.addSong(data.id, data.song);
        });
        $rootScope.$on('song:update', function(event, data) {
            $rootScope.$broadcast('popup:show', {type: 'info', 'message': data.message});
            console.log(data.message);
            SongManager.updateCounter(data.id, data.count);
            $rootScope.$apply();
        });
        $rootScope.$on('song:remove', function(event, id) {
            SongManager.removeSong(id);
        });
    };

    angular.module('musicpoll').controller('ListController', ListController);
})();