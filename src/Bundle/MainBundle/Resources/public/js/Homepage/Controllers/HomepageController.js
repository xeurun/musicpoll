(function() {
    "use strict";

    function HomepageController ($mdToast, $http, Config) {
        this.roomId         = null;
        this.password       = null;
        this.newPassword    = null;

        var postWrap = function(request) {
            return request
            .success(function(response, status, headers, config) {
                if (response.backUrl && !response.message)  {
                    window.location.href = response.backUrl;
                } else if(response.message) {
                    $mdToast.show(
                        $mdToast.simple()
                            .content(response.message)
                            .position('bottom left')
                            .hideDelay(5000)
                    );
                }
            })
            .error(function(response, status, headers, config) {

            });
        };

        this.create = function() {
            postWrap($http.post(Config.ROUTING.create, {
                    password: this.newPassword
                }));
        };

        this.return = function(href) {
            document.location.href = href;
        };

        this.enter = function() {
            postWrap($http.post(Config.ROUTING.enter, {
                roomId: this.roomId,
                password: this.password
            }));
        };
    };

    angular.module('musicpoll').controller('HomepageController', HomepageController);
})();