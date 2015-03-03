(function() {
    "use strict";

    function UserManager(ApiService, Config) {
        var UserManager     = {},
            users           = {},
            userPrototype   = {
                getId: function() {
                    return this.id;
                },
                isPlayer: function() {
                    return this.id === Config.OWNERID;
                },
                isAdmin: function() {
                    return this.admin;
                },
                isCurrent: function() {
                    return this.id === Config.USERID;
                },
                getFullname: function() {
                    return this.fullname;
                }
            };

        UserManager.loadUsers = function() {
            ApiService.get(Config.ROUTING.getUsers).then(function(data) {
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
            return users[Config.USERID];
        };

        return UserManager;
    };

    angular.module('musicpoll').factory('UserManager', UserManager);
})();