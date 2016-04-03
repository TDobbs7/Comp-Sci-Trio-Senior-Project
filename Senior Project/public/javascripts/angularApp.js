"use strict";

var app = angular.module('senior_project', ['ngRoute']);

app.config(['$routeProvider', 'USER_ROLES',
    function($routeProvider, USER_ROLES) {
        $routeProvider.
            when('/', {
                templateUrl: '/views/login.html',
                controller: 'UserCtrl',
                require_login: false,
                good_roles: [USER_ROLES.judge, USER_ROLES.evt_admin, USER_ROLES.sys_admin]
            }).
            when('/register', {
                templateUrl: '/views/registerHTML.html',
                controller: 'UserCtrl',
                require_login: false,
                good_roles: [USER_ROLES.judge, USER_ROLES.evt_admin, USER_ROLES.sys_admin]
            }).
            when('/home', {
                templateUrl: 'views/userPageHTML.html',
                controller: 'UserCtrl',
                require_login: true,
                good_roles: [USER_ROLES.judge, USER_ROLES.evt_admin, USER_ROLES.sys_admin]
            }).
            otherwise({
                redirectTo: '/'
            });
    }
]);


app.run(function($location, $rootScope, $route, AuthenticationService, UserService) {
    $rootScope.location = $location;
    $rootScope.currentUserData = JSON.parse(window.localStorage.getItem("user"));
    $rootScope.requestedPerson = JSON.parse(window.localStorage.getItem("req_person"));
    $rootScope.requestedUser = JSON.parse(window.localStorage.getItem("req_user"));

    $rootScope.logout = function() {
        $rootScope.currentUserData.user.last_login = $rootScope.currentUserData.timestamp;
        UserService.UpdateUser($rootScope.currentUserData.user).then(function(res) {
            AuthenticationService.clearCurrentUser();

            $location.path('/');
            alert("You have logged out");
        }, function(res) {
          $rootScope.stopAndReport(res);
        });

        /*AuthenticationService.clearCurrentUser();

        $location.path('/');
        alert("You have logged out");*/
    };

    $rootScope.stopAndReport = function(res) {
        event.preventDefault();
        alert(res.message);
    }

    $rootScope.$on('$locationChangeStart', function(event, next, current) {
        var next_path = $location.path();
        var next_route = $route.routes[next_path];

        if (next_path == '/' && AuthenticationService.isAuthenticated()) {
          event.preventDefault();
          $location.path('/home');
        }
        if (next_route && next_route.require_login) {
          if(!AuthenticationService.isAuthenticated()) {
            $rootScope.stopAndReport({'message' : "You must be logged in first"});
            $location.path('/');
          }
          else if (!AuthenticationService.isAuthorized(next_route.good_roles)) {
            $rootScope.stopAndReport({'message' : "You are not authorized to view this page : " + $rootScope.currentUserData.user.user_role});

            next_path = '/home';
            $location.path(next_path);
          } else $location.path(next_path);
        }
    });
});

app.constant('USER_ROLES', {
    judge: 'judge',
    evt_admin: 'evt_admin',
    sys_admin: 'sys_admin'
});

app.factory('UserService', ['$http', '$rootScope',
    function($http, $rootScope) {
        var service = {};

        service.GetAllUsers = GetAllUsers;
        service.GetByEmail = GetByEmail;
        service.AddNewUser = AddNewUser;
        service.UpdateUser = UpdateUser;
        service.Login = Login;

        return service;

        function GetAllUsers() {
            return $http.get('/users').then(handleSuccess, handleError('Error getting all users'));
        }

        function GetByEmail(email) {
            return $http.get('/users/email/' + email).then(handleSuccess, handleError('Error getting user by username'));
        }

        function AddNewUser(user) {
            return $http.post('/users', user).then(handleSuccess, handleError('Error creating user'));
        }

        function Login(credentials) {
            return $http.post('/users/login', credentials).then(handleSuccess, handleError('Invalid email and/or password'));
        }

        function UpdateUser(user) {
            return $http.put('/users/' + user.email, user).then(handleSuccess, handleError('Error updating user'));
        }

        // private functions

        function handleSuccess(res) {
            if (typeof res != "undefined") return {"success" : true, "data" : res.data};
        }

        function handleError(error) {
            if (typeof error != "undefined") return {"success" : false, "message" : error};
        }
    }
])
.factory('AuthenticationService', ['$rootScope', 'UserService',
    function($rootScope, UserService) {
        var service = {};

        service.Login = Login;
        service.isAuthenticated = isAuthenticated;
        service.isAuthorized = isAuthorized;
        service.setCurrentUser = setCurrentUser;
        service.clearCurrentUser = clearCurrentUser;

        return service;

        function Login(email, password) {
            var credentials = {
                'email' : email,
                'password' : password
            }

            return UserService.Login(credentials).then(handleSuccess, handleError("Invalid email and/or password"));
        }

        function isAuthenticated() {
            return ($rootScope.currentUserData !== null);
        }

        function setCurrentUser(data) {
            window.localStorage.setItem("user", JSON.stringify(data));
            $rootScope.currentUserData = data;
        }

        function clearCurrentUser() {
            window.localStorage.clear();
            $rootScope.currentUserData = null;
            $rootScope.requestedPerson = null;
            $rootScope.requestedUser = null;
        }

        function isAuthorized(good_roles) {
            return (good_roles.indexOf($rootScope.currentUserData.user.user_role) !== -1);
        }

        function handleSuccess(res) {
            return {"success" : true, "data" : res.data};
        }

        function handleError(error) {
            return {"success" : false, "message" : error};
        }
    }
]);

app.controller('UserCtrl', ['$scope', '$rootScope', '$location', 'USER_ROLES', 'AuthenticationService', 'UserService',
    function($scope, $rootScope, $location, USER_ROLES, AuthenticationService, UserService) {
        $scope.login = function(email, password) {
            AuthenticationService.Login(email, password).then(successLogin, failed);
        };

        function successLogin(res) {
            AuthenticationService.setCurrentUser(res.data);
            $location.path('/home');
        }

        function failed(res) {
            $rootScope.stopAndReport(res.data);
        }

        $scope.register = function(user) {
            if (user.password !== user.password2) $rootScope.stopAndReport({'message' : "Your passwords didn't match!"});
            else {
                delete user.password2;

                UserService.AddNewUser({"name" : user.fname + " " + user.lname, "email" : user.email, "password" : user.password})
                    .then(function(res) {
                        alert("You have registered!");
                        $location.path('/');
                    }, failed);
            }
        }
    }
]);