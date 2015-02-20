(function() {
    "use strict";

    function ModalFormController($modal, Config) {
        this.open = function () {
            $modal.open({
                templateUrl: Config.Routing.form,
                controller: 'ModalFormInstanceController'
            });
        };
    };

    function ModalFormInstanceController($scope, $sce, $modalInstance, Config, ApiService, PlayerManager) {
        $scope.songs = [];
        $scope.types = ['VK'];
        $scope.form = {
            song: {
                type: 'VK',
                _token: ''
            }
        };
        $scope.previewPlayer = PlayerManager;

        $scope.$on('player:error', function() {
            $scope.form.song.url = '';
            $scope.previewPlayer.pause();
            $scope.$apply();
        });

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
            $scope.previewPlayer.pause();
            ApiService.sendRequest(Config.Routing.add, $scope.form);
            $scope.song = {};
            $modalInstance.dismiss('save');
        };

        $scope.playPreview = function ($event) {
            if($event) $event.preventDefault();
            if((!$scope.previewPlayer.getState().pause && !$scope.previewPlayer.getState().playing) || $scope.previewPlayer.getState().pause) {
                $scope.previewPlayer.playByUrl($scope.form.song.url);
            } else {
                $scope.previewPlayer.pause();
            }
        };

        $scope.trustAsHtml = function(value) {
            return $sce.trustAsHtml(value);
        };

        $scope.refreshSongs = function(term) {
            return ApiService.getJsonP(
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

        $scope.cancel = function () {
            $scope.previewPlayer.pause();
            $modalInstance.dismiss('cancel');
        };
    };

    angular.module('musicpoll').controller('ModalFormInstanceController', ModalFormInstanceController);
    angular.module('musicpoll').controller('ModalFormController', ModalFormController);
})();