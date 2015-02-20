(function() {
    "use strict";

    function PopupMessageController ($scope, $rootScope, $timeout) {
        var self = this,
            promise;

        this.type       = 'info';
        this.show       = false;
        this.popups     = [];
        this.message    = '';

        $rootScope.$on('popup:show', function(event, data) {
            if(data.save) {
                self.popups.push({
                    type: data.type,
                    message: data.message
                });
            } else {
                $timeout.cancel(promise);
                self.type       = data.type;
                self.message    = data.message;
                self.show       = true;
                promise = $timeout(function() {
                    self.show = false;
                }, 3000);
            }
        });

        $rootScope.$on('popup:hide', function() {
            self.popups.splice(0, self.popups.length);
            $scope.$apply();
        });
    };

    angular.module('musicpoll').controller('PopupMessageController', PopupMessageController);
})();