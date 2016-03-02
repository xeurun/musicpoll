(function() {
    "use strict";

    function UserListController($modal, $templateCache, UserManager, Config) {
        this.show = false;
        this.userManager = UserManager;

        this.open = function (id) {
            var url = Config.ROUTING.userStatistics.replace('_ID_', id);
            $modal.open({
                templateUrl: url
            }).result.then(function () {}, function () {
                $templateCache.remove(url);
            });
        };
    };

    angular.module('musicpoll').controller('UserListController', UserListController);
})();