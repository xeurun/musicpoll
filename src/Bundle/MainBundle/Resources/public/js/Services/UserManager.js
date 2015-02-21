(function() {
    "use strict";

    function UserManager($interval, ApiService, Config) {
        var UserManager     = {},
            users           = {},
            userPrototype   = {
                isPlayer: function() {
                    return this.admin;
                }
            };

        UserManager.loadUsers = function() {
            ApiService.get(Config.Routing.getUsers).then(function(data) {
                angular.forEach(data.entities, function(value, index) {
                    users[index] = angular.extend(value, userPrototype);
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

        $interval(function() {
            UserManager.loadUsers();
        }, Config.UPDATE_USERS_INTERVAL);

        return UserManager;
    };

    angular.module('musicpoll').factory('UserManager', UserManager);
})();