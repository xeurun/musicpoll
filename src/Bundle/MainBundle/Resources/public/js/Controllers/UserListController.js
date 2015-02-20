(function() {
    "use strict";

    function UserListController($scope, UserManager) {
        var self = this;

        this.show = false;
        this.users = [];

        $scope.$watchCollection(UserManager.getUsers, function(data) {
            self.users = data;
        });

        this.getCurrentUser = function () {
            return UserManager.getCurrentUser();
        };

        this.isCurrentUser = function (id) {
            return UserManager.isCurrentUser(id);
        };
    };

    angular.module('musicpoll').controller('UserListController', UserListController);
})();