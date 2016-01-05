angular.module('starter.controllers', ['ionic.rating'])

.controller('AppCtrl', function($scope, $ionicModal, $timeout, Auth, $location) {

  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //$scope.$on('$ionicView.enter', function(e) {
  //});

  // Create the login modal that we will use later
  $ionicModal.fromTemplateUrl('templates/login.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modal = modal;
  });

  Auth.$onAuth(function(authData) {
    if (authData === null) {
      console.log("Not logged in yet");
    } else {
      console.log("Logged in as", authData.uid);
    }
    $scope.authData = authData; // This will display the user's name in our view
  });
  
  $scope.login = function() {
    Auth.$authWithOAuthPopup("google", function(error, authData) {
      if (error) {
        console.log("Login Failed!", error);
      } else {
        console.log("Authenticated successfully with payload:", authData);
      }
    }, {
      remember: "sessionOnly",
      scope: "email"
    });
  };
  $scope.logout = function(){
    Auth.$unauth();
    $location.path("/series");
  };
  $scope.timeToDate = function(time) {
    return new Date(time).toLocaleString()
  };
})

.controller('SeriesCtrl', function($scope, $ionicLoading) {
  $ionicLoading.show({
    template: 'Loading...'
  });
  theMovieDb.discover.getTvShows({}, function(res){
    var response = JSON.parse(res);
    response.results.forEach(function(part, index, theArray) {
      theArray[index].portada = "http://image.tmdb.org/t/p/w92/"+theArray[index].poster_path;
      theArray[index].rate = theArray[index].vote_average;
      theArray[index].max = 10;
    });
    $scope.series = response.results;
    $ionicLoading.hide();
  }, function(err){
    $ionicLoading.hide();
  });
})

.controller('SerieCtrl', function($scope, $ionicLoading, $ionicModal, $stateParams, Comments) {
  $ionicLoading.show({
    template: 'Loading...'
  });
  theMovieDb.tv.getById({"id":$stateParams.serieId}, function(res){
    var response = JSON.parse(res);
    $scope.serie = response;
    $scope.serie.comments = Comments.tv.getById($stateParams.serieId);
    theMovieDb.tv.getImages({"id":$stateParams.serieId}, function(res){
      var images = JSON.parse(res).backdrops;
      var max_aspect_ratio = 0;
      images.forEach(function(part, index, theArray) {
        theArray[index].file_path = "http://image.tmdb.org/t/p/w300/"+theArray[index].file_path;
      });
      $scope.serie.portada = images[0].file_path;
      $scope.serie.images = images;
      $ionicLoading.hide();
    }, function(){
      $ionicLoading.hide();
    });
  }, function(){
    $ionicLoading.hide();
  });
  $scope.comment = {};
  $scope.comment.text = "";
  $scope.showImages = function(index) {
    $scope.activeSlide = index;
    $scope.showModal('templates/image-popover.html');
  }
  $scope.showModal = function(templateUrl) {
    $ionicModal.fromTemplateUrl(templateUrl, {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function(modal) {
      $scope.modal = modal;
      $scope.modal.show();
    });
  }
  $scope.sendMessage = function(text) {
    if (text) {
      $scope.serie.comments.$add({
        "userType": $scope.authData.uid,
        "provider": $scope.authData.provider,
        "userId": $scope.authData.google.id,
        "userName": $scope.authData.google.displayName,
        "createdAt": Date.now(),
        "message": text
      });
      $scope.comment.text = "";
    }
  }
 
  // Close the modal
  $scope.closeModal = function() {
    $scope.modal.hide();
    $scope.modal.remove()
  };
})
.controller('SeasonCtrl', function($scope, $ionicLoading, $ionicModal, $stateParams) {
  $ionicLoading.show({
    template: 'Loading...'
  });
  theMovieDb.tvSeasons.getById({"id":$stateParams.serieId, "season_number": $stateParams.seasonNum}, function(res){
    var response = JSON.parse(res);
    $scope.season = response;
    $scope.serie = {};
    $scope.serie.id = $stateParams.serieId;
    $scope.season.portada = "http://image.tmdb.org/t/p/w500/"+$scope.season.poster_path;
    $ionicLoading.hide();
  }, function(){
    $ionicLoading.hide();
  })
})
.controller('EpisodeCtrl', function($scope, $ionicLoading, $ionicModal, $stateParams, $resource) {
  $ionicLoading.show({
    template: 'Loading...'
  });
  theMovieDb.tvEpisodes.getById({"id":$stateParams.serieId, "season_number": $stateParams.seasonNum, "episode_number": $stateParams.episodeNum}, function(res){
    var response = JSON.parse(res);
    $scope.episode = response;
    $scope.episode.portada = "http://image.tmdb.org/t/p/w500/"+$scope.episode.still_path;
    $ionicLoading.hide();
  }, function(){
    $ionicLoading.hide();
  });
})
.controller('ProfileCtrl', function($scope, $ionicLoading, RequiereLogin) {
  $ionicLoading.show({
    template: 'Loading...'
  });
  $scope.$on('$ionicView.enter', function(e) {
    RequiereLogin.compruebaLogin($scope.authData);
    $scope.prueba = "prueba";
    $ionicLoading.hide();
  });
});
