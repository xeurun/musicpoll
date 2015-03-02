(function() {
    "use strict";

    function ModalFormController($rootScope, $modal, Config) {
        this.open = function () {
            $modal.open({
                templateUrl: Config.ROUTING.form,
                controller: 'ModalFormInstanceController'
            }).result.then(function () {}, function () {
                $rootScope.$broadcast('modalForm:close');
            });
        };
    };

    function ModalFormInstanceController($scope, $modalInstance, Config, ApiService, PlayerManager) {
        $scope.songs = [];
        $scope.types = ['VK'];
        $scope.form  = {
            song: {
                type:   'VK',
                _token: ''
            }
        };
        $scope.previewPlayer = new PlayerManager(
            {
                onerror: function() {
                    $scope.form.song.url = '';
                    $scope.previewPlayer.pause();
                }
            }
        );

        $scope.$watch('songs.selected', function(newValue) {
            if(newValue) {
                $scope.previewPlayer.pause();
                $scope.form.song.url        = newValue.url;
                $scope.form.song.title      = newValue.title;
                $scope.form.song.artist     = newValue.artist;
                $scope.form.song.duration   = newValue.duration;
            }
        });

        $scope.save = function () {
            ApiService.post(Config.ROUTING.add, $scope.form);
            $modalInstance.dismiss('save');
        };

        $scope.play = function ($event) {
            if($event) $event.preventDefault();
            if(!$scope.previewPlayer.getState().isPlaying()) {
                $scope.previewPlayer.playByUrl($scope.form.song.url);
            } else {
                $scope.previewPlayer.pause();
            }
        };

        $scope.refreshSongs = function(term) {
            if(term.length > 2) {
                ApiService.jsonp(Config.ROUTING.vk_api.replace('_method_', 'audio.search'), {
                    callback: 'JSON_CALLBACK',
                    q: term,
                    auto_complete: 1,
                    access_token: Config.TOKEN,
                    v: '5.28'
                }).then(function(data) {
                    if(!angular.isUndefined(data.response)) {
                        $scope.songs = data.response.items
                    }
                });
            };
        };

        $scope.$on('modalForm:close', function() {
            $scope.previewPlayer.pause();
        });

        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };
    };

    angular.module('musicpoll').controller('ModalFormInstanceController', ModalFormInstanceController);
    angular.module('musicpoll').controller('ModalFormController', ModalFormController);
})();