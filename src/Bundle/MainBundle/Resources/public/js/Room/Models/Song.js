(function() {
    "use strict";

    function Song(Config, UserManager) {
        var Song = function(song) {
            var id          = song.id,
                url         = song.url,
                title       = song.title,
                voted       = song.voted,
                artist      = song.artist,
                author      = song.author,
                counter     = song.counter,
                disabled    = false,
                authorId    = song.authorId,
                duration    = song.duration;

            //TODO: Public field only for angular filter
            return {
                title: title,
                counter: counter,
                authorId: authorId,
                getId: function() {
                    return id;
                },
                getUrl: function() {
                    return url;
                },
                disable: function() {
                    disabled = true;
                },
                getDuration: function() {
                    return duration;
                },
                getTitle: function() {
                    return title;
                },
                getArtist: function() {
                    return artist;
                },
                getAuthor: function() {
                    return UserManager.getUser(authorId);
                },
                getAuthorFullname: function() {
                    return author;
                },
                isDisabled: function() {
                    return disabled;
                },
                updateCounter: function(count) {
                    counter = count;
                },
                getCounter: function() {
                    return counter;
                },
                isMy: function() {
                    return authorId === Config.USERID;
                },
                getVoted: function() {
                    return voted;
                },
                vote: function() {
                    voted = true;
                }
            }
        };

        return Song;
    };

    angular.module('musicpoll').factory('Song', Song);
})();