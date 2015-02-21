(function() {
    "use strict";

    function PopupMessageController ($scope, $rootScope, $timeout) {
        var self = this,
            hidePopup = function(index) {
                $timeout(function() {}, 3000 + 3500 * (self.popups.length - 1)).then(function() {
                    self.popups[index].show = false;
                    $timeout(function() {}, 3500).then(function() {
                        self.popups.splice(index, 1);
                    });
                });
            };

        this.popups     = [];

        $rootScope.$on('popup:show', function(event, data) {
            var save = angular.isUndefined(data.save) ? false : data.save;

            self.popups.push({
                message:    data.message,
                type:       data.type,
                save:       save,
                show:       true
            });

            if(!save) {
                hidePopup(0);
            }
        });

        $rootScope.$on('popup:hide', function() {
            angular.forEach(self.popups, function(value, index) {
                if(value.save) {
                    hidePopup(index);
                }
            });
            $scope.$apply();
        });
    };

    angular.module('musicpoll').controller('PopupMessageController', PopupMessageController);
})();