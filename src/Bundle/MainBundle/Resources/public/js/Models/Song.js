(function() {
    "use strict";

    function Song() {

        var Song = {};

        return function(data) {
            this.id = data.id;
            this.title = data.title;
            this.link = data.link;
            this.type = data.type;
            this.counter = data.counter;
        };

        return Song;
    };

    angular.module('musicpoll').factory('Song', Song);
})();