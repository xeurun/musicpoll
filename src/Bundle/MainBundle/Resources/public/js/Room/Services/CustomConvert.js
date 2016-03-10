(function() {
    "use strict";

    function CustomConvert() {
        var CustomConvert = {};

        CustomConvert.toHHMMSS = function(duration) {
            var sec_num = parseInt(duration, 10);
            var hours   = Math.floor(sec_num / 3600);
            var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
            var seconds = sec_num - (hours * 3600) - (minutes * 60);

            var hourSeparator = ':';
            var minuteSeparator = ':';

            if (hours == 0) {
                hours = '';
                hourSeparator = '';
            }
            if (minutes < 10 && hours != 0) {
                minutes = '0' + minutes;
            }
            if (seconds < 10) {
                seconds = '0' + seconds;
            }

            return hours + hourSeparator + minutes + minuteSeparator + seconds;
        };

        return CustomConvert;
    };

    angular.module('musicpoll').factory('CustomConvert', CustomConvert);
})();