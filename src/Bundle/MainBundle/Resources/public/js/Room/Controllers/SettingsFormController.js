(function() {
    "use strict";

    function SettingsFormController($rootScope, $modal, UserManager) {
        this.userManager = UserManager;

        this.open = function () {
            $modal.open({
                templateUrl: 'settings.html',
                controller: function ($scope, $modalInstance, ApiService, Config) {
                    $scope.settings = {
                        skip: Config.ROOM.SETTINGS.SKIP,
                        radio: Config.ROOM.SETTINGS.RADIO
                    };

                    $scope.save = function () {
                        ApiService.put(Config.ROUTING.setting.replace('_ID_', Config.ROOM.ID), $scope.settings);
                        $modalInstance.dismiss('save');
                    };

                    $scope.close = function () {
                        $modalInstance.dismiss('cancel');
                    };
                }
            });
        };
    };

    angular.module('musicpoll').controller('SettingsFormController', SettingsFormController);
})();