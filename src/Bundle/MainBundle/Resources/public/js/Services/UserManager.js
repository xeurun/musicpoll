(function() {
    "use strict";

    function UserManager($timeout, ApiService, Config) {
        var UserManager = {},
            users = {};

        UserManager.loadUsers = function() {
            ApiService.get(Config.Routing.getUsers).success(function(data){
                angular.forEach(data.entities, function(value, index) {
                    users[index] = value;
                });
            });
        };

        UserManager.getUsers = function() {
            return users;
        };

        UserManager.getUser = function(id) {
            return users[id];
        };

        UserManager.getCurrentUser = function() {
            return users[Config.userId];
        };

        UserManager.isAdmin = function (id) {
            return users[id].admin;
        };

        UserManager.isCurrentUser = function (id) {
            return id === Config.userId;
        };

        UserManager.loadUsers();

        $timeout(function() {
            UserManager.loadUsers();
        }, 300000);

        return UserManager;
    };

    angular.module('musicpoll').factory('UserManager', UserManager);
})();