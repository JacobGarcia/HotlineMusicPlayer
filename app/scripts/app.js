//require("./landing");
//require('./collection');
//require('./album');
//require("./profile");

// Example album.
var albumPicasso = {
    name: 'The Colors',
    artist: 'Pablo Picasso',
    label: 'Cubism',
    year: '1881',
    albumArtUrl: '/images/album-placeholder.png',

    songs: [{
        name: 'Blue',
        length: 163.38,
        audioUrl: '/music/placeholders/blue'
    }, {
        name: 'Green',
        length: 105.66,
        audioUrl: '/music/placeholders/green'
    }, {
        name: 'Red',
        length: 270.14,
        audioUrl: '/music/placeholders/red'
    }, {
        name: 'Pink',
        length: 154.81,
        audioUrl: '/music/placeholders/pink'
    }, {
        name: 'Magenta',
        length: 37.92,
        audioUrl: '/music/placeholders/magenta'
    }]
};
var artist;
/*************** Routes ******************/
blocJams = angular.module('BlocJams', ['ui.router']);
blocJams.config(['$stateProvider', '$locationProvider', function($stateProvider, $locationProvider) {
    $locationProvider.html5Mode(true);

    $stateProvider.state('landing', {
        url: '/',
        controller: 'Landing.controller',
        templateUrl: '/templates/landing.html'
    });

    $stateProvider.state('collection', {
        url: '/collection',
        controller: 'Collection.controller',
        templateUrl: '/templates/collection.html'
    });

    $stateProvider.state('artist', {
        url: '/artist/:artist_id',
        controller: 'Artist.controller',
        templateUrl: '/templates/artist.html'
    });

    $stateProvider.state('album', {
        url: '/album/:album_id',
        controller: 'Album.controller',
        templateUrl: '/templates/album.html'
    });

}]);

// This is a cleaner way to call the controller than crowding it on the module definition.
blocJams.controller('Landing.controller', ['$scope', function($scope) {
    $scope.subText = "Turn the music up!";

    $scope.subTextClicked = function() {
        $scope.subText += '!';
    };
}]);

blocJams.controller('Collection.controller', ['$scope', '$http', 'SongPlayer', function($scope, $http, SongPlayer) {
    $scope.albums = [];

    $http.get('/api/getcollection')
            .success(function(data) {
                $scope.albums = data;
                console.log(data);

                angular.forEach($scope.albums, function(value, key){
                  $http.get('/api/getsongs/'+value.ID)
                  .success(function(data) {
                    value.songs = [];
                    value.songs = data;
                    console.log(data);
                  })
                  .error(function(data) {
                      console.log('Error: ' + data);
                  });
                });
            })
            .error(function(data) {
                console.log('Error: ' + data);
            });

    $scope.playAlbum = function(album) {
        SongPlayer.setSong(album, album.songs[0]); // Targets first song in the array.
    };

}]);

blocJams.controller('Artist.controller', ['$scope', '$http', 'SongPlayer', '$stateParams', function($scope, $http, SongPlayer, $stateParams) {
  $scope.albums = [];

  $http.get('/api/getartists/' + $stateParams.artist_id)
          .success(function(data) {
              $scope.albums = data;
              console.log(data);

              angular.forEach($scope.albums, function(value, key){
                $http.get('/api/getsongs/'+value.ID)
                .success(function(data) {
                  value.songs = [];
                  value.songs = data;
                  console.log(data);
                })
                .error(function(data) {
                    console.log('Error: ' + data);
                });
              });
          })
          .error(function(data) {
              console.log('Error: ' + data);
          });

  $scope.playAlbum = function(album) {
      SongPlayer.setSong(album, album.songs[0]); // Targets first song in the array.
  };

}]);

blocJams.controller('Album.controller', ['$scope', '$http', 'SongPlayer', '$stateParams', function($scope, $http, SongPlayer, $stateParams) {
    $http.get('/api/getalbum/' + $stateParams.album_id)
            .success(function(data) {
                $scope.album = data;
                
                $http.get('/api/getsongs/'+$scope.album[0].ID)
                .success(function(data) {
                  $scope.album[0].songs = [];
                  $scope.album[0].songs = data;

                  angular.forEach($scope.album[0].songs, function(song, key){
                    var currentSoundFile = null;
                    currentSoundFile = new buzz.sound('/music/' + song.ID, {
                        formats: ["mp3"],
                        preload: true
                    });

                    currentSoundFile.bind('canplay', function(e) {
                        song.length = currentSoundFile.getDuration();
                    });
                  });
                })
                .error(function(data) {
                    console.log('Error: ' + data);
                });

            })
            .error(function(data) {
                console.log('Error: ' + data);
            });
    var hoveredSong = null;


    $scope.onHoverSong = function(song) {
        hoveredSong = song;
    };

    $scope.offHoverSong = function(song) {
        hoveredSong = null;
    };

    $scope.getSongState = function(song) {
        if (song === SongPlayer.currentSong && SongPlayer.playing) {
            return 'playing';
        } else if (song === hoveredSong) {
            return 'hovered';
        }
        return 'default';
    };

    $scope.playSong = function(song) {
        SongPlayer.setSong($scope.album, song);
    };

    $scope.pauseSong = function(song) {
        SongPlayer.pause();
    };

}]);

blocJams.controller('PlayerBar.controller', ['$scope', 'SongPlayer', function($scope, SongPlayer) {
    $scope.songPlayer = SongPlayer;


   $scope.volumeClass = function() {
     return {
       'fa-volume-off': SongPlayer.volume === 0,
       'fa-volume-down': SongPlayer.volume <= 70 && SongPlayer.volume > 0,
       'fa-volume-up': SongPlayer.volume > 70
     };
   };

    SongPlayer.onTimeUpdate(function(event, time) {
        $scope.$apply(function() {
            $scope.playTime = time;
        });
    });

}]);

blocJams.service('SongPlayer', ['$rootScope', function($rootScope) {
    var currentSoundFile = null;
    var trackIndex = function(album, song) {
        return album.songs.indexOf(song);
    };

    return {
        currentSong: null,
        currentAlbum: null,
        playing: false,
        volume: 90,

        play: function() {
            this.playing = true;
            currentSoundFile.play();
        },
        pause: function() {
            this.playing = false;
            currentSoundFile.pause();
        },
        next: function() {
            var currentTrackIndex = trackIndex(this.currentAlbum, this.currentSong);
            currentTrackIndex++;
            if (currentTrackIndex >= this.currentAlbum.songs.length) {
                currentTrackIndex = 0;
            }
            var song = this.currentAlbum.songs[currentTrackIndex];
            this.setSong(this.currentAlbum, song);
        },
        previous: function() {
            var currentTrackIndex = trackIndex(this.currentAlbum, this.currentSong);
            currentTrackIndex--;
            if (currentTrackIndex < 0) {
                currentTrackIndex = this.currentAlbum.songs.length - 1;
            }

            var song = this.currentAlbum.songs[currentTrackIndex];
            this.setSong(this.currentAlbum, song);
        },

        seek: function(time) {
            // Checks to make sure that a sound file is playing before seeking.
            if (currentSoundFile) {
                // Uses a Buzz method to set the time of the song.
                currentSoundFile.setTime(time);
            }
        },
        setVolume: function(volume) {
            if (currentSoundFile) {
                currentSoundFile.setVolume(volume);
            }
            this.volume = volume;
        },

        onTimeUpdate: function(callback) {
            return $rootScope.$on('sound:timeupdate', callback);
        },

        setSong: function(album, song) {
            if (currentSoundFile) {
                currentSoundFile.stop();
            }
            this.currentAlbum = album;
            this.currentSong = song;

            currentSoundFile = new buzz.sound('/music/' + song.ID, {
                formats: ["mp3"],
                preload: true
            });

            currentSoundFile.setVolume(this.volume);
            currentSoundFile.bind('timeupdate', function(e) {
                song.length = currentSoundFile.getDuration();
                $rootScope.$broadcast('sound:timeupdate', this.getTime());
            });

            this.play();
        }
    };
}]);

blocJams.directive('slider', ['$document', function($document) {

    // Returns a number between 0 and 1 to determine where the mouse event happened along the slider bar.
    var calculateSliderPercentFromMouseEvent = function($slider, event) {
        var offsetX = event.pageX - $slider.offset().left; // Distance from left
        var sliderWidth = $slider.width(); // Width of slider
        var offsetXPercent = (offsetX / sliderWidth);
        offsetXPercent = Math.max(0, offsetXPercent);
        offsetXPercent = Math.min(1, offsetXPercent);
        return offsetXPercent;
    };

    var numberFromValue = function(value, defaultValue) {
        if (typeof value === 'number') {
            return value;
        }

        if (typeof value === 'undefined') {
            return defaultValue;
        }

        if (typeof value === 'string') {
            return Number(value);
        }
    };


    return {
        templateUrl: '/templates/directives/slider.html', //We'll create these files shortly.
        replace: true,
        restrict: 'E',
        scope: {
            onChange: '&'
        },
        link: function(scope, element, attributes) {
            //These values represent the progress into the song/volume bar, and its max value.
            //For now, we're supplying arbitrary initial and max values.

            var notifyCallback = function(newValue) {
                if (typeof scope.onChange === 'function') {
                    scope.onChange({
                        value: newValue
                    });
                }
            };

            scope.value = 0;
            scope.max = 100;
            var $seekBar = $(element);

            attributes.$observe('value', function(newValue) {
                scope.value = numberFromValue(newValue, 0);
            });

            attributes.$observe('max', function(newValue) {
                scope.max = numberFromValue(newValue, 100) || 100;
            });

            var percentString = function() {
                var value = scope.value || 0;
                var max = scope.max || 100;
                percent = value / max * 100;
                return percent + "%";
            };

            scope.fillStyle = function() {
                return {
                    width: percentString()
                };
            };

            scope.thumbStyle = function() {
                return {
                    left: percentString()
                };
            };

            scope.onClickSlider = function(event) {
                var percent = calculateSliderPercentFromMouseEvent($seekBar, event);
                scope.value = percent * scope.max;
                notifyCallback(scope.value);

            };

            scope.trackThumb = function() {
                $document.bind('mousemove.thumb', function(event) {
                    var percent = calculateSliderPercentFromMouseEvent($seekBar, event);
                    scope.$apply(function() {
                        scope.value = percent * scope.max;
                        notifyCallback(scope.value);

                    });
                });

                //cleanup
                $document.bind('mouseup.thumb', function() {
                    $document.unbind('mousemove.thumb');
                    $document.unbind('mouseup.thumb');
                });

            };

        }
    };
}]);

blocJams.filter('timecode', function() {
    return function(seconds) {
        seconds = Number.parseFloat(seconds);

        // Returned when no time is provided.
        if (Number.isNaN(seconds)) {
            return '-:--';
        }

        // make it a whole number
        var wholeSeconds = Math.floor(seconds);

        var minutes = Math.floor(wholeSeconds / 60);

        remainingSeconds = wholeSeconds % 60;

        var output = minutes + ':';

        // zero pad seconds, so 9 seconds should be :09
        if (remainingSeconds < 10) {
            output += '0';
        }

        output += remainingSeconds;

        return output;
    };
});
