'use strict';

angular.module('app', ['ngRoute', 'ngCookies', 'ui.bootstrap', 'app.login', 'app.post']).
  config(['$routeProvider','$httpProvider', function($routeProvider, $httpProvider){
      $routeProvider.
          when('/all-posts/:mode', {templateUrl: 'static/partials/posts.html', controller: PostListCtrl}).
          when('/submit', {templateUrl: 'static/partials/new-post.html', controller: NewPostCtrl}).
          when('/post/:postId', {templateUrl: 'static/partials/post.html', controller:ReadPostCtrl}).
          otherwise({redirectTo: '/all-posts/top'});

      // CSRF compat with Django
      $httpProvider.defaults.useXDomain = true;
      delete $httpProvider.defaults.headers.common['X-Requested-With'];

  }]).
  run(['$rootScope', '$location', '$http', '$cookies', 'User', function($rootScope, $location, $http, $cookies, User){
      // make User service globally accessible
      $rootScope.User = User;

      // CSRF compat with Django
      $http.defaults.headers.post['X-CSRFToken'] = $cookies.csrftoken;

      // Highlight paths helper function,
      // returns true if path param matches current path
      $rootScope.isCurrentPath = function(path, exactMatch){
        if (exactMatch){
          return $location.path() == path;
        } else {
          return $location.path().indexOf(path) == 0;
        }
      };
     User.isLoggedIn();
  }]);

//
// Should be replaced to some more conventional place
//
String.prototype.format = function () {
  var args = arguments;
  return this.replace(/\{\{|\}\}|\{(\d+)\}/g, function (m, n) {
    if (m == "{{") { return "{"; }
    if (m == "}}") { return "}"; }
    return args[n];
  });
};