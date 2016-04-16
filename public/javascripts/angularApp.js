"use strict";

var app = angular.module('senior_project', ['ngRoute']);

app.config(['$routeProvider', 'USER_ROLES',
    function($routeProvider, USER_ROLES) {
        $routeProvider.
            when('/', {
                templateUrl: '/views/login.html',
                controller: 'UserCtrl',
                require_login: false
            }).
            when('/register', {
                templateUrl: '/views/registerHTML.html',
                controller: 'UserCtrl',
                require_login: false
            }).
            when('/home', {
                templateUrl: '/views/userPageHTML.html',
                controller: 'UserCtrl',
                require_login: true,
                good_roles: [USER_ROLES.regular, USER_ROLES.judge, USER_ROLES.evt_admin, USER_ROLES.sys_admin]
            }).
            when('/judge/auth', {
                templateUrl: '/views/judgeEventHTML.html',
                controller: 'JudgeCtrl',
                require_login: true,
                good_roles: [USER_ROLES.regular, USER_ROLES.judge, USER_ROLES.evt_admin, USER_ROLES.sys_admin]
            }).
            when('/addEvent', {
                templateUrl: '/views/event_page.html',
                controller: 'EventCtrl',
                require_login: true,
                good_roles: [USER_ROLES.evt_admin, USER_ROLES.sys_admin]
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
    regular: 'regular',
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
            return {"success" : true, "data" : res.data};
        }

        function handleError(error) {
            return {"success" : false, "message" : error};
        }
    }
])
.factory('EventService', ['$http', '$rootScope',
    function($http, $rootScope) {
        var service = {};

        service.addEvent = addEvent;
        service.editEvent = editEvent;

        return service;

        function addEvent(event) {
            return $http.post('/events', event).then(handleSuccess, handleError("Error adding event"));
        }

        function editEvent(event) {
            return $http.put('/events/' + event.evt_id, event).then(handleSuccess, handleError("Error updating email"));
        }

        function verifyEventCode(code) {
            return $http.post('/events/verify', code).then(handleSuccess, handleError("Invalid event code"));
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
])
.factory('EmailService', ['$http',
    function($http){
        var service = {};

        service.sendEmail = sendEmail;

        return service;

        function sendEmail(data) {
            return $http.post('/email', data).then(handleSuccess, handleError("Error sending email"));
        }

        function handleSuccess(res) {
            return {"success" : true, "data" : res.data};
        }

        function handleError(error) {
            return {"success" : false, "message" : error};
        }
    }
]);

app.controller('UserCtrl', ['$scope', '$rootScope', '$location', 'USER_ROLES', 'AuthenticationService', 'UserService', 'EmailService',
    function($scope, $rootScope, $location, USER_ROLES, AuthenticationService, UserService, EmailService) {
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

        $scope.sendEmail = function() {
            var data = {
                'email' : {
                    from : 'contactus.scored@gmail.com',
                    to: 'tdobbs7@gmail.com',
                    subject: 'You know what\'s up',
                    text: 'Test Test Test'
                }
            }

            EmailService.sendEmail(data).then(
                function(res) {
                    alert("Email sent successfully to " + email.to + " at " + res.data.timestamp);
                    $location.path('/home');
                }, failed
            );
        }
    }
])
.controller('JudgeCtrl', ['$scope', 'EventService',
    function($scope, EventService) {
        $scope.verifyEventCode = function(code) {
            EventService.
        }
    }
])
.controller('EventCtrl', ['$scope',
    function($scope) {
        $scope.event = {};

        $scope.addOrEditEvent = function(event) {

        }
    }
]);