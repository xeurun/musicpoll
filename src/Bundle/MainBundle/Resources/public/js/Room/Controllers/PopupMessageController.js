(function() {
    "use strict";

    function PopupMessageController ($scope, $rootScope, $timeout, Config) {
        var self = this,
            hidePopup = function(index, delay) {
                // DELAY_FOR_POPUP for delay and POPUP_ANIMATION_DURATION for animation * count
                // (individual animation for every next)
                delay = angular.isNumber(delay) ? delay : Config.POPUP_ANIMATION_DURATION;
                $timeout(function() {}, Config.DELAY_FOR_POPUP + delay * (self.popups.length - 1)).then(function() {
                    self.popups[index].show = false;
                    $timeout(function() {}, delay).then(function() {
                        self.popups.splice(index, 1);
                    });
                });
            };

        this.popups = [];

        $rootScope.$on('popup:show', function(event, data) {
            var save = angular.isUndefined(data.save) ? false : data.save;

            self.popups.push({
                message:    data.message,
                type:       data.type,
                save:       save,
                show:       true
            });

            if(!save) {
                //if not saved start remove process for first popup
                hidePopup(0, data.delay);
            }
        });

        $rootScope.$on('popup:hide', function() {
            angular.forEach(self.popups, function(value, index) {
                if(value.save) {
                    //if saved popup remove it
                    self.popups.splice(index, 1);
                }
            });
            $scope.$apply();
        });
    };

    angular.module('musicpoll').controller('PopupMessageController', PopupMessageController);
})();