(function () {
    'use strict';

    angular.module('musicpoll').directive('lrInfiniteScroll', ['$timeout', function (timeout) {
        return{
            link: function (scope, element, attr) {
                var lengthThreshold = attr.scrollThreshold || 50,
                    timeThreshold = attr.timeThreshold || 400,
                    handler = scope.$eval(attr.lrInfiniteScroll),
                    promise = null,
                    lastRemaining = 9999;

                lengthThreshold = parseInt(lengthThreshold, 10);
                timeThreshold = parseInt(timeThreshold, 10);

                if (!handler || !angular.isFunction(handler)) {
                    handler = angular.noop;
                }

                element.bind('scroll', function () {
                    var remaining = element[0].scrollHeight - (element[0].clientHeight + element[0].scrollTop);
                    //if we have reached the threshold and we scroll down
                    if (remaining < lengthThreshold && (remaining - lastRemaining) < 0) {
                        //if there is already a timer running which has no expired yet we have to cancel it and restart the timer
                        if (promise !== null) {
                            timeout.cancel(promise);
                        }
                        promise = timeout(function () {
                            handler();
                            promise = null;
                        }, timeThreshold);
                    }
                    lastRemaining = remaining;
                });
            }

        };
    }]);
})();
