(function() {
    "use strict";

    function NewSongFormController($rootScope, $modal, Config) {
        this.open = function () {
            $modal.open({
                templateUrl: Config.ROUTING.form,
                controller: function ($scope, $modalInstance, Config, ApiService, PlayerManager, CustomConvert) {
                    $scope.songs = [];
                    $scope.types = ['VK'];
                    $scope.form  = {
                        song: {
                            duration: 0,
                            type:   'VK',
                            _token: ''
                        }
                    };

                    $scope.getDurationFormatted = function () {
                        return CustomConvert.toHHMMSS($scope.form.song.duration);
                    };
                    
                    $scope.previewPlayer = new PlayerManager(
                        {
                            onerror: function() {
                                $scope.form.song.url = '';
                                $scope.previewPlayer.pause();
                            }
                        }
                    );

                    $scope.$watch('songs.selected', function(newValue) {
                        if(newValue) {
                            $scope.previewPlayer.pause();
                            $scope.form.song.url        = newValue.url;
                            $scope.form.song.title      = newValue.title;
                            $scope.form.song.artist     = newValue.artist;
                            $scope.form.song.duration   = newValue.duration;
                            $scope.form.song.genreId    = newValue.genre_id;
                        }
                    });

                    $scope.$on('room:appCommand', function(event, data) {
                        if (data.command == 'add' && Config.USERID == data.user) {
                            $scope.form.song.url        = data.content.url;
                            $scope.form.song.title      = data.content.title;
                            $scope.form.song.artist     = data.content.artist;
                            $scope.form.song.duration   = data.content.duration;
                            $scope.form.song.genreId    = data.content.genre_id;
                            ApiService.post(Config.ROUTING.add, $scope.form);
                        }
                    });

                    $scope.save = function () {
                        ApiService.post(Config.ROUTING.add, $scope.form);
                        $modalInstance.dismiss('save');
                    };

                    $scope.play = function ($event) {
                        if($event) $event.preventDefault();
                        if(!$scope.previewPlayer.getState().isPlaying()) {
                            $scope.previewPlayer.playByUrl($scope.form.song.url);
                        } else {
                            $scope.previewPlayer.pause();
                        }
                    };

                    $scope.refreshSongs = function(term) {
                        if(term.length > 2) {
                            ApiService.jsonp(Config.ROUTING.vk_api.replace('_method_', 'audio.search'), {
                                callback: 'JSON_CALLBACK',
                                q: term,
                                auto_complete: 1,
                                access_token: Config.TOKEN,
                                v: '5.28'
                            }).then(function(data) {
                                if(!angular.isUndefined(data.response)) {
                                    $scope.songs = data.response.items
                                }
                            });
                        };
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
    };

    angular.module('musicpoll').controller('NewSongFormController', NewSongFormController);
})();