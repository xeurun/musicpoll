(function () {
    "use strict";

    function Song(Config, UserManager, CustomConvert) {
        var Song = function (song) {
            var id          = song.id,
                url         = song.url,
                title       = song.title,
                voted       = song.voted,
                artist      = song.artist,
                author      = song.author,
                counter     = song.counter,
                disabled    = false,
                authorId    = song.authorId,
                duration    = song.duration,
                genre_id    = song.genre_id,
                source_id   = song.source_id,
                type        = song.type;

            //TODO: Public field only for angular filter
            return {
                title: title,
                counter: counter,
                authorId: authorId,
                getId: function () {
                    return id;
                },
                getUrl: function () {
                    if (type == 'sc') {
                        return url + '?client_id=' + Config.SC_TOKEN;
                    } else {
                        return url;
                    }
                },
                disable: function () {
                    disabled = true;
                },
                getDuration: function () {
                    return duration;
                },
                getGenreId: function () {
                    return genre_id;
                },
                getSourceId: function () {
                    return source_id;
                },
                getGenre: function () {
                    var genre = '';
                    switch (genre_id) {
                        case 1:
                            genre = 'Rock';
                            break;
                        case 2:
                            genre = 'Pop';
                            break;
                        case 3:
                            genre = 'Rap & Hip-Hop';
                            break;
                        case 4:
                            genre = 'Easy Listening';
                            break;
                        case 5:
                            genre = 'Dance & House';
                            break;
                        case 6:
                            genre = 'Instrumental';
                            break;
                        case 7:
                            genre = 'Metal';
                            break;
                        case 8:
                            genre = 'Dubstep';
                            break;
                        case 9:
                            genre = 'Jazz & Blues';
                            break;
                        case 10:
                            genre = 'Drum & Bass';
                            break;
                        case 11:
                            genre = 'Trance';
                            break;
                        case 12:
                            genre = 'Chanson';
                            break;
                        case 13:
                            genre = 'Ethnic';
                            break;
                        case 14:
                            genre = 'Acoustic & Vocal';
                            break;
                        case 15:
                            genre = 'Reggae';
                            break;
                        case 16:
                            genre = 'Classical';
                            break;
                        case 17:
                            genre = 'Indie Pop';
                            break;
                        case 19:
                            genre = 'Speech';
                            break;
                        case 21:
                            genre = 'Alternative';
                            break;
                        case 22:
                            genre = 'Electropop & Disco';
                            break;
                        default:
                            genre = 'Other';
                            break;
                    }

                    return genre;
                },
                getDurationFormatted: function () {
                    return CustomConvert.toHHMMSS(duration);
                },
                getTitle: function () {
                    return title;
                },
                getArtist: function () {
                    return artist;
                },
                getAuthor: function () {
                    return UserManager.getUser(authorId);
                },
                getAuthorFullname: function () {
                    return author;
                },
                isDisabled: function () {
                    return disabled;
                },
                updateCounter: function (count) {
                    counter = count;
                },
                getCounter: function () {
                    return counter;
                },
                isMy: function () {
                    return authorId === Config.USERID;
                },
                getVoted: function () {
                    return voted;
                },
                vote: function () {
                    voted = true;
                }
            }
        };

        return Song;
    };

    angular.module('musicpoll').factory('Song', Song);
})();