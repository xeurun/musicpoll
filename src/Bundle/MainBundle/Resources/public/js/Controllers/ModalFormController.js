(function() {
    "use strict";

    function ModalFormController($scope, $rootScope, $modal, Config) {
        this.open = function () {
            $modal.open({
                templateUrl: Config.Routing.form,
                controller: 'ModalFormInstanceController'
            }).result.then(function () {}, function () {
                $rootScope.$broadcast('modalForm:close');
            });
        };
    };

    function ModalFormInstanceController($scope, $modalInstance, Config, ApiService, PlayerManager) {
        $scope.songs = [];
        $scope.types = ['VK'];
        $scope.form = {
            song: {
                type: 'VK',
                _token: ''
            }
        };
        $scope.previewPlayer = new PlayerManager(
            {
                onerror: function() {
                    $scope.form.song.url = '';
                    $scope.previewPlayer.pause();
                    $scope.$apply();
                }
            }
        );

        $scope.$watch('songs.selected', function(newValue) {
            $scope.previewPlayer.pause();
            if(newValue) {
                $scope.form.song.url        = newValue.url;
                $scope.form.song.title      = newValue.title;
                $scope.form.song.artist     = newValue.artist;
                $scope.form.song.duration   = newValue.duration;
            }
        });

        $scope.save = function () {
            ApiService.sendRequest(Config.Routing.add, $scope.form);
            $modalInstance.dismiss('save');
        };

        $scope.playPreview = function ($event) {
            if($event) $event.preventDefault();
            if(!$scope.previewPlayer.getState().playing) {
                $scope.previewPlayer.playByUrl($scope.form.song.url);
            } else {
                $scope.previewPlayer.pause();
            }
        };

        $scope.refreshSongs = function(term) {
            if(term.length > 2) {
                ApiService.getJsonP(
                    Config.Routing.vk_api.replace('_method_', 'audio.search'),
                    {
                        callback: 'JSON_CALLBACK',
                        q: term,
                        auto_complete: 1,
                        access_token: Config.token,
                        v: '5.28'
                    }
                ).then(function(response) {
                    if(response.data.response) {
                        $scope.songs = response.data.response.items
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