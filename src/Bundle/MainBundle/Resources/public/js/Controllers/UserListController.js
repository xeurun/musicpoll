(function() {
    "use strict";

    function UserListController(UserManager) {
        this.show = false;
        this.userManager = UserManager;
    };

    angular.module('musicpoll').controller('UserListController', UserListController);
})();