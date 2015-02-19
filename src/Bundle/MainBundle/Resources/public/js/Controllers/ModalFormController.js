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

    function ModalFormInstanceController($scope, $modalInstance, Config, ApiService) {
        $scope.songs = [];
        $scope.types = ['VK'];
        $scope.form = {
            song: {
                type: 'VK',
                _token: ''
            }
        };
        $scope.playing = false;
        $scope.previewPlayer = document.createElement('audio');

        $scope.$watch('songs.selected', function(newValue) {
            if(newValue) {
                $scope.form.song.title   = newValue.title;
                $scope.form.song.url     = newValue.url;
            }
        });

        $scope.ok = function () {
            ApiService.sendRequest(Config.Routing.add, $scope.form);
            $scope.song = {};
            $modalInstance.dismiss('cancel');
        };

        $scope.playPreview = function ($event) {
            $event.preventDefault();

            if($scope.playing) {
                $scope.previewPlayer.pause();
            } else {
                $scope.previewPlayer.src = $scope.form.song.url;
                $scope.previewPlayer.play();
            }

            $scope.playing = !$scope.playing;
        };

        $scope.previewPlayer.onended = $scope.previewPlayer.onerror = function () {
            $scope.form.song.url = '';
            $scope.playing = false;
            $scope.$apply();
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
                $scope.songs = response.data.response.items;
            });
        };

        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };
    };

    angular.module('musicpoll').controller('ModalFormInstanceController', ModalFormInstanceController);
    angular.module('musicpoll').controller('ModalFormController', ModalFormController);
})();