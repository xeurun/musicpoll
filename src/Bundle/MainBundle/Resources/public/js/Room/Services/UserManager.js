(function() {
    "use strict";

    function UserManager($rootScope, ApiService, Config, User) {
        var UserManager     = {},
            users           = {};

        UserManager.loadUsers = function() {
            ApiService.get(Config.ROUTING.getUsers).then(function(data) {
                angular.forEach(data.entities, function(value, index) {
                    users[index] = new User(value);
                });
            });
        };

        $rootScope.$on('room:enter', function(event, data) {
            users[data.id] = new User(data);
        });

        $rootScope.$on('room:leave', function(event, data) {
            delete users[data];
        });

        UserManager.getUsers = function() {
            return users;
        };

        UserManager.getUser = function(id) {
            return users[id];
        };

        UserManager.getCurrentUser = function() {
            return users[Config.USERID];
        };

        return UserManager;
    };

    angular.module('musicpoll').factory('UserManager', UserManager);
})();