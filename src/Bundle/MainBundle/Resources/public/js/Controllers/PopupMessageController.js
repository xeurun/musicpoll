(function() {
    "use strict";

    function PopupMessageController ($rootScope, $timeout) {
        var self = this;

        this.type     = 'info';
        this.message  = '';
        this.show     = false;

        $rootScope.$on('popup:show', function(event, data) {
            self.type       = data.type;
            self.message    = data.message;
            self.show       = true;
            $timeout(function() {
                self.show = false;
            }, 3000);
        });
    };

    angular.module('musicpoll').controller('PopupMessageController', PopupMessageController);
})();