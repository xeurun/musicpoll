(function() {
    "use strict";

    function User(Config) {
        var User = function(user) {
            var id          = user.id,
                admin       = user.admin,
                fullname    = user.fullname;

            return {
                getId: function() {
                    return id;
                },
                isPlayer: function() {
                    return id === Config.OWNERID;
                },
                isAdmin: function() {
                    return admin;
                },
                isCurrent: function() {
                    return id === Config.USERID;
                },
                getFullname: function() {
                    return fullname;
                }
            }
        };

        return User;
    };

    angular.module('musicpoll').factory('User', User);
})();