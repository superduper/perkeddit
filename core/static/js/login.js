var LOGIN_API_URL = "/api/v1/core/auth/login",
    LOGOUT_API_URL = "/api/v1/core/auth/logout",
    PROFILE_API_URL = "/api/v1/core/auth/profile",
    SIGNUP_API_URL = "/api/v1/core/auth/signup";

angular.module('app.login', []).
    config(['$httpProvider', function($httpProvider) {
        $httpProvider.
            responseInterceptors.
            push(['$q', '$location',            
              function($q, $location){
                function success(response){
                    return response;
                }                
                function error(response) {
                    var isAuthRequest = (response.config.url == LOGIN_API_URL);
                    if (!isAuthRequest && response.status == 401) {
                        // redirect to our internal login page
                        alert("Authentication required");
                    }
                    return $q.reject(response);
                }
                return function(promise) {
                    return promise.then(success, error);
                }
            }
        ]);
    }]).
    factory('User',['$http', function($http){
        var authenticated = false, 
            profile = {
                username: "Unknown"
            };
        function setupProfile(data){
             authenticated = true;
             profile = data;
        }
        function resetProfile(){
            profile = null;
            authenticated = false;
        }
        return {
            isAuthenticated: function() {
                return authenticated;
            }, 
            getName: function() {
                if (profile) return profile.username;
            },
            isLoggedIn: function(loggedInCallback, notLoggedInCallback, failureCallback) {
                return $http({
                         method: "GET",
                         url: PROFILE_API_URL
                     }).
                     success(function(data, status, error, config){
                        setupProfile(data);
                        if(loggedInCallback)loggedInCallback();
                     }).
                     error(function(data, status, error, config){
                        if (status == 400 || status == 401 || status == 403) {
                            if(notLoggedInCallback) notLoggedInCallback();
                        } else {
                            if(failureCallback) failureCallback();
                        }
                     });
            },
            login: function(creds, successCallback, errorCallback, failureCallback){
                return $http({
                             method: "POST",
                             url: LOGIN_API_URL,
                             data:{
                                username: creds.username,
                                password: creds.password
                            }
                         }).
                         success(function(data, status, error, config){
                            setupProfile(data);
                            if (successCallback) successCallback(data);
                         }).
                         error(function(data, status, error, config){
                            if (status == 400 || status == 401 || status == 403) {
                                if (errorCallback) errorCallback(data);
                            } else {
                                if (failureCallback) failureCallback(data);
                            }
                         });
            },
            signup: function(creds, successCallback, errorCallback, failureCallback){
                return $http({
                             method: "POST",
                             url: SIGNUP_API_URL,
                             data:{
                                username: creds.username,
                                email: creds.email,
                                password: creds.password
                            }
                         }).
                         success(function(data, status, error, config){
                            setupProfile(data);
                            if (successCallback) successCallback(data);
                         }).
                         error(function(data, status, error, config){
                            if (status == 400 || status == 401 || status == 403) {
                                if (errorCallback) errorCallback(data);
                            } else {
                                if (failureCallback) failureCallback(data);
                            }
                         });
            },
            logout: function(){
                resetProfile();
                return $http.post(LOGOUT_API_URL);
            }
        }
    }]).
    directive('authBox', ['$location', '$timeout', 'User', function($location, $timeout, User){
        return {
            templateUrl: 'static/partials/authbox.html',
            controller: function($scope){
                $scope.submitLogin = function(creds){
                    $scope.loginError = null;
                    User.login(creds, null, function(err){
                        $scope.loginError = err.non_field_errors;
                    });
                };

                $scope.submitSignup = function(creds){
                    $scope.signupError = null;
                    User.signup(creds, null, function(err){
                        $scope.signupError = err.non_field_errors;
                    });
                };
            }
        }
    }]);
