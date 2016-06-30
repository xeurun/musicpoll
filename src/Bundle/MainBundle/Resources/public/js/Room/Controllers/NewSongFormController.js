(function() {
    "use strict";

    function NewSongFormController($rootScope, $modal, Config) {
        this.open = function () {
            $modal.open({
                templateUrl: Config.ROUTING.form,
                controller: function ($scope, $modalInstance, Config, ApiService, PlayerManager, CustomConvert) {
                    $scope.songs = [];
                    $scope.types = ['vk', 'sc'];
                    $scope.form  = {
                        song: {
                            url:        '',
                            title:      '',
                            type:       'vk',
                            sourceId:   null,
                            duration:   0
                        }
                    };
                    $scope.duration = 0;
                    $scope.previewPlayer = new PlayerManager(
                        {
                            onerror: function() {
                                $scope.form.song.url = '';
                                $scope.previewPlayer.pause();
                            }
                        }
                    );

                    $scope.$watch('songs.selected', function(newValue) {
                        $scope.previewPlayer.pause();

                        if(!angular.isUndefined(newValue)) {
                            $scope.form.song.title      = newValue.title;
                            $scope.form.song.sourceId   = newValue.id;
                            if(!angular.isUndefined(newValue.stream_url)) {
                                $scope.form.song.url        = newValue.stream_url;
                                $scope.form.song.artist     = newValue.user != undefined ? newValue.user.username : '';
                                $scope.form.song.duration   = newValue.duration / 1000;
                                $scope.form.song.genreId    = 0;
                                $scope.form.song.type       = 'sc';
                            } else {
                                $scope.form.song.url        = newValue.url;
                                $scope.form.song.artist     = newValue.artist;
                                $scope.form.song.duration   = newValue.duration;
                                $scope.form.song.genreId    = newValue.genre_id;
                                $scope.form.song.type       = 'vk';
                            }
                        }

                        $scope.duration = CustomConvert.toHHMMSS($scope.form.song.duration);
                    });

                    $scope.save = function () {
                        ApiService.post(Config.ROUTING.add, $scope.form);
                        $modalInstance.dismiss('save');
                    };

                    $scope.clear = function () {
                        $scope.songs = [];
                        $scope.form  = {
                            song: {
                                url:        '',
                                duration:   0
                            }
                        };
                    };

                    $scope.play = function ($event) {
                        if($event) $event.preventDefault();
                        if(!$scope.previewPlayer.getState().isPlaying()) {
                            var url = $scope.form.song.url;
                            if ($scope.form.song.type == 'sc') {
                                url += '?client_id=' + Config.SC_TOKEN;
                            }
                            $scope.previewPlayer.playByUrl(url);
                        } else {
                            $scope.previewPlayer.pause();
                        }
                    };

                    $scope.refreshSongs = function(term, type) {
                        if(term.length > 2) {
                            if (type == 'vk') {
                                ApiService.jsonp(Config.ROUTING.vk_api.replace('_method_', 'audio.search'), {
                                    callback: 'JSON_CALLBACK',
                                    q: term,
                                    auto_complete: 1,
                                    access_token: Config.TOKEN,
                                    v: '5.28'
                                }).then(function(data) {
                                    if(!angular.isUndefined(data.response)) {
                                        $scope.songs = data.response.items;
                                    }
                                });
                            } else {
                                ApiService.get(Config.ROUTING.sc_api, {
                                    client_id: Config.SC_TOKEN,
                                    q: term,
                                    types: 'tracks'
                                }).then(function(data) {
                                    if(!angular.isUndefined(data)) {
                                        $scope.songs = data;
                                    }
                                });
                            }
                        }
                    };

                    $scope.$on('modalForm:close', function() {
                        $scope.previewPlayer.pause();
                    });

                    $scope.cancel = function () {
                        $modalInstance.dismiss('cancel');
                    };
                }
            }).result.then(function () {}, function () {
                $rootScope.$broadcast('modalForm:close');
            });
        };
    }

    angular.module('musicpoll').controller('NewSongFormController', NewSongFormController);
})();