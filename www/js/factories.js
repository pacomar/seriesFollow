angular.module('starter.factories', [])

.factory("Auth", function($firebaseAuth) {
  var ref = new Firebase("https://seriesfollow.firebaseio.com");
  return $firebaseAuth(ref);
})
.factory('RequiereLogin', function($location, $ionicHistory){
	return {
		compruebaLogin:function(authData){
			if(authData){
				return true;
			}else{
				$location.path("/series");
				$ionicHistory.clearCache();
				return false;
			}
		}
	};
})
.factory('Comments', function($firebaseArray){
	return {
		tv: {
			getById:function(tvId) {
				var comentsRef = new Firebase("https://seriesfollow.firebaseio.com/comments/tv/"+tvId);
				return $firebaseArray(comentsRef);
			}
		}
	}
});