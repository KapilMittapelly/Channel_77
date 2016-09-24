(function () {

    'use strict';
    var app = angular.module('myApp', []);

    var buildCarousel = function () {
        $('.owl-carousel').owlCarousel({
            nav: true,
            dots: false,
            mouseDrag: false,
            responsive: {
                0: {
                    items: 1
                },
                600: {
                    items: 1
                },
                850: {
                    items: 3
                }
            }
        });
    };

    app.config(function ($sceDelegateProvider) {
        $sceDelegateProvider.resourceUrlWhitelist(['**']);
    });

    app.directive('emitLastRepeaterElement', function () {
        return function (scope) {
            if (scope.$last) {
                scope.$emit('ngRepeatFinished');
            }
        };
    });

    app.controller('PlayerController', function ($scope, $http, myFactory, nprService) {

        var programs,
            apiKey = 'MDI2MDE2MzA0MDE0NzE5MTk5MzQ0ZGRiZQ000',
            nprUrl = 'http://api.npr.org/query?id=61&fields=relatedLink,title,byline,text,audio,image,pullQuote,all&output=JSON';

        $scope.myFactory = myFactory;
        nprService.programs(apiKey, nprUrl).
            success(function (data, status) {
                programs = data.list.story;
                $scope.playlist = myFactory.buildPlaylist(programs);
            });
        $scope.playing = false;
        $scope.myFactory = myFactory;

        $scope.play = function (song) {
            myFactory.play(song, $scope);
        };

        $scope.stop = function (song) {
            myFactory.stop(song, $scope);
        };

        $scope.$on('ngRepeatFinished', function () {
            buildCarousel();
        });
    });

    app.factory('myFactory', function () {
        var i, myFactory = {

            play: function (song, $scope) {
                for (i = 0; i < $scope.playlist.length; i += 1) {
                    if ($scope.playlist[i].name === song.name) {
                        document.getElementById(song.name).play();
                        song.playing = true;
                        document.getElementById(song.name).parentNode.parentNode.className += " center";
                    } else if ($scope.playlist[i].playing === true) {
                        document.getElementById($scope.playlist[i].name).pause();
                        $scope.playlist[i].playing = false;
                        document.getElementById($scope.playlist[i].name).parentNode.parentNode.classList.remove("center");
                    }
                }
            },
            stop: function (song, $scope) {
                document.getElementById(song.name).pause();
                song.playing = false;
                document.getElementById(song.name).parentNode.parentNode.classList.remove("center");
            },
            buildPlaylist: function (programs) {
                var i, song, program, playlist = [];
                for (i = 0; i < programs.length; i += 1) {
                    song = {};
                    program = programs[i];
                    song.name = program.title.$text;
                    if (program.audio[0].format.mp4) {
                        song.url = program.audio[0].format.mp4.$text;
                        song.duration = program.audio[0].duration.$text;
                        song.playing = false;
                        playlist.push(song);
                    }
                }
                return playlist;
            }
        };

        return myFactory;
    });

    app.factory('nprService', ['$http', function ($http) {
        var doRequest = function (apiKey, nprUrl) {
            return $http({
                method: 'JSONP',
                url: nprUrl + '&apiKey=' + apiKey + '&callback=JSON_CALLBACK'
            });
        };

        return {
            programs: function (apiKey, nprUrl) {
                return doRequest(apiKey, nprUrl);
            }
        };
    }]);

}());