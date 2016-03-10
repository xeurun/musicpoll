(function() {
    "use strict";

    function ProfileFormController($modal, $timeout, Config) {
        var self = this;

        this.setBackground = function (background) {
            angular.element(document.body).css('background-image', 'url(' + background + ')');
        };

        this.open = function () {
            $modal.open({
                templateUrl: 'profile.html',
                controller: function ($scope, $modalInstance, ApiService, Config) {
                    $scope.profile = {
                        background: Config.USER.BACKGROUND
                    };

                    $scope.save = function () {
                        ApiService.put(Config.ROUTING.profile, $scope.profile);
                        self.setBackground($scope.profile.background);
                        $modalInstance.dismiss('save');
                    };

                    $scope.close = function () {
                        $modalInstance.dismiss('cancel');
                    };
                }
            });
        };

        $timeout(self.setBackground(Config.USER.BACKGROUND), 0);
    };

    angular.module('musicpoll').controller('ProfileFormController', ProfileFormController);
})();