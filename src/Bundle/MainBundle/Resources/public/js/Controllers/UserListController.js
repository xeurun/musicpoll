(function() {
    "use strict";

    function UserListController(ApiService, Config) {
        var self = this;

        this.show = false;
        this.users = [];

        ApiService.get(Config.Routing.getUsers).success(function(data){
            angular.forEach(data.users, function(value, index) {
                self.users.push(value);
            });
        });

        this.isCurrentUser = function (id) {
            return id === Config.userId;
        };
    };

    angular.module('musicpoll').controller('UserListController', UserListController);
})();