"use strict";

var app = angular.module('senior_project', ['ngRoute', 'angularCSS']);

app.config(['$routeProvider', 'USER_ROLES',
    function($routeProvider, USER_ROLES) {
        $routeProvider.
            when('/', {
                templateUrl: '/views/login.html',
                controller: 'UserCtrl',
                require_login: false,
                css: ['/stylesheets/gradient.css', '/stylesheets/signin.css']
            }).
            when('/register', {
                templateUrl: '/views/registerHTML.html',
                controller: 'UserCtrl',
                require_login: false,
                css: ['/stylesheets/gradient.css', '/stylesheets/registerCSS.css']
            }).
            when('/home', {
                templateUrl: '/views/userPageHTML.html',
                controller: 'UserCtrl',
                require_login: true,
                good_roles: [USER_ROLES.regular, USER_ROLES.judge, USER_ROLES.evt_admin, USER_ROLES.sys_admin],
                css: ['/stylesheets/gradient.css', '/stylesheets/userPageCSS.css']
            }).
            when('/judge/auth', {
                templateUrl: '/views/judgeEventHTML.html',
                controller: 'JudgeCtrl',
                require_login: true,
                good_roles: [USER_ROLES.regular, USER_ROLES.judge, USER_ROLES.evt_admin, USER_ROLES.sys_admin],
                css: '/stylesheets/gradient.css'
            }).
            when('/addEvent', {
                templateUrl: '/views/event_page.html',
                controller: 'EventCtrl',
                require_login: true,
                good_roles: [USER_ROLES.evt_admin, USER_ROLES.sys_admin],
                css: '/stylesheets/gradient.css'
            }).
            when('/contact_us', {
                templateUrl: '/views/contactUsHTML.html',
                controller: 'UserCtrl',
                require_login: false,
                good_roles: [USER_ROLES.regular, USER_ROLES.judge, USER_ROLES.evt_admin, USER_ROLES.sys_admin],
                css: '/stylesheets/gradient.css'
            }).
            when('/about_us', {
                templateUrl: '/views/aboutUsHTML.html',
                controller: 'UserCtrl',
                require_login: false,
                good_roles: [USER_ROLES.regular, USER_ROLES.judge, USER_ROLES.evt_admin, USER_ROLES.sys_admin],
                css: '/stylesheets/aboutPageCSS.css'
            }).
            when('/judge/event_form', {
                templateUrl: '/views/formPage.html',
                controller: 'JudgeCtrl',
                require_login: true,
                good_roles: [USER_ROLES.judge, USER_ROLES.sys_admin],
                css: '/stylesheets/gradient.css'
            }).
            when('/viewEvents', {
                templateUrl: '/views/viewEventsHTML.html',
                controller: 'EventCtrl',
                require_login: true,
                good_roles: [USER_ROLES.regular, USER_ROLES.judge, USER_ROLES.evt_admin, USER_ROLES.sys_admin],
                css: '/stylesheets/gradient.css'
            }).
            otherwise({
                redirectTo: '/'
            });
    }
]);

app.run(function($location, $rootScope, $route, AuthenticationService, UserService, EmailService) {
    $rootScope.location = $location;
    $rootScope.route = $route.routes[$location.path()]
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
          $rootScope.stopAndReport(res.data);
        });
    };

    $rootScope.sendEmail = function(sender, recs, email_subject, message) {
        var data = {
            'email' : {
                from : sender,
                recipients: recs,
                subject: email_subject,
                text: message
            }
        };

        EmailService.sendEmail(data).then(
            function(res) {
                alert("Your email was sent!");
                $location.path('/');
            }, function(res) { failed(res); }
        );
    }

    $rootScope.contactUs = function(contacter) {
        var sender = contacter.email_addr;
        var recipients = ["contactus.scored@gmail.com"];
        var subject = contacter.email_subject;
        var text = "You received a message from " + contacter.name + ". Here is the message:\n\n" + contacter.email_message;

        $rootScope.sendEmail(sender, recipients, subject, text)
    }

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
            return {"data" : res.data};
        }

        function handleError(error) {
            return {"message" : error};
        }
    }
])
.factory('EventService', ['$http', '$rootScope',
    function($http, $rootScope) {
        var service = {};

        service.addEvent = addEvent;
        service.getAllEvents = getAllEvents;
        service.editEvent = editEvent;
        service.removeEvent = removeEvent;
        service.verifyEventCode = verifyEventCode;
        service.getEvent = getEvent;

        service.events = [];

        return service;

        function getAllEvents() {
            return $http.get('/events').then(setEvents, handleError("No events found"));
        }

        function getAllEventsHostedByUser(email) {
            var data = {
                "email" : email
            };

            return $http.get('/events', data).then(setEvents, handleError("No events hosted by " + email));
        }

        function addEvent(event) {
            return $http.post('/events', event).then(handleSuccess, handleError("Error adding event"));
        }

        function getEvent(evt_id) {
            return $http.get('/events/' + evt_id).then(handleSuccess, handleError("Event does not exist"));
        }

        function editEvent(event) {
            return $http.put('/events/' + event.evt_id, event).then(handleSuccess, handleError("Error updating email"));
        }

        function removeEvent(event) {
            return $http.delete('/events/' + event.evt_id, event).then(handleSuccess, handleError("Error deleting email"));
        }

        function verifyEventCode(credentials) {
            return $http.post('/events/verify', credentials).then(handleSuccess, handleError("Invalid event code"));
        }

        function setEvents(res) {
            $scope.events = res.data.events;
            handleSuccess(res);
        }

        function handleSuccess(res) {
            return {"data" : res.data};
        }

        function handleError(error) {
            return {"message" : error};
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
            //return (good_roles.indexOf($rootScope.currentUserData.user.user_role) !== -1);
            for(var index in $rootScope.currentUserData.user.user_role) {
                if (good_roles.indexOf($rootScope.currentUserData.user.user_role[index]) !== -1) return true;
            }

            return false;
        }

        function handleSuccess(res) {
            return {"data" : res.data};
        }

        function handleError(error) {
            return {"message" : error};
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
            return {"data" : res.data};
        }

        function handleError(error) {
            return {"message" : error};
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
    }
])
.controller('JudgeCtrl', ['$scope', '$rootScope', '$location', 'EventService', 'UserService', 'USER_ROLES',
    function($scope, $rootScope, $location, EventService, UserService, USER_ROLES) {
        $scope.verifyEventCode = function(code) {
            var credentials = {
                email: $rootScope.currentUserData.user.email,
                evt_code: code
            };

            EventService.verifyEventCode(credentials).then(function(res) {
                $rootScope.event = res.data.event;

                if ($rootScope.currentUserData.user.user_role.indexOf(USER_ROLES.judge) < 0) {
                    $rootScope.currentUserData.user.user_role.push(USER_ROLES.judge);

                    UserService.UpdateUser($rootScope.currentUserData.user).then(function(res) {
                    }, function(res) {
                        $rootScope.stopAndReport(res.data);
                    });
                }

                alert("You can now judge this event: " + $scope.event.name);
                $location.path('/judge/event_form');

            }, function(res) {
                $rootScope.stopAndReport(res.data);
            });
        }

        $scope.populateForm = function() {
            console.log($rootScope.event);
        }

        /*$scope.populateForm = function() {
            /*var el = document.createElement('div');
            el.setAttribute('data-ng-model', "event.name");
            el.setAttribute('class', 'form-group');
            el.innerHTML = '<input type="text" data-ng-model="event.name"  readonly>'

            var temp = $compile(el)($scope);
            angular.element(document.querySelector('#judges')).append(temp);*/

            /*$scope.event.criteria.forEach(function(criteria, index) {
                var el = document.createElement('div');
                el.setAttribute('id', 'crit-' + (index+1));
                el.innerHTML = '<label class="col-md-2 control-label">' + criteria + '</label><input type="range" defaultValue="1" min="1" max="' + $scope.event.max_scale + '" step="1">';

                var temp = $compile(el)($scope);
                angular.element(document.querySelector("#criteria")).append(temp);
            });

            //Diplay Location
            //Team/Project Name
            //Criteria w Radio Buttons

            //Comment Box
        }*/
    }
])
.controller('EventCtrl', ['$scope', '$rootScope', '$compile', '$location', 'UserService', 'EventService', 'EmailService', 'USER_ROLES',
    function($scope, $rootScope, $compile, $location, UserService, EventService, EmailService, USER_ROLES) {
        $scope.number_of_judges = 1;
        $scope.number_of_criteria = 1;

        $scope.addEvent = function(event) {
            event.judges = [];
            event.criteria = [];

            event.evt_id = Math.random().toString(36).substring(2, 9);
            event.event_host = $rootScope.currentUserData.user.email;

            var judgesHTML = $('#judges')[0].children;

            for (var i = 0; i < judgesHTML.length; i++) {
                var judge = {};

                judge.name = judgesHTML[i].children.name.value;
                judge.address = judgesHTML[i].children.email.value;

                event.judges.push(judge);
            }

            var criteriaHTML = $('#jcrit')[0].children;

            for (var i = 0; i < criteriaHTML.length; i++) {
                var criterion = criteriaHTML[i].children.criterion.value;

                event.criteria.push(criterion);
            }

            event.max_scale = $('input[name="tblebttn"]:checked').val();

            EventService.addEvent(event).then(function(res) {
                var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
                var message = "Hello,\n\nWe would like to invite you to join this competition, " + event.name +", as a judge" +
                              " or as an honored guest. The contest will be held at " + event.location + " on " +
                              months[event.start_date.getMonth()] + " " + event.start_date.getDate() + ", " +
                              event.start_date.getFullYear() + " starting at " + formatAMPM(event.start_date) + ". We sincerely " +
                              "hope that you are available to attend. \n\nGo to scored.ncat.edu to register. You must be " +
                              "connected to an NCAT network in order to use the website.\n\nWhen registering for this " +
                              "competition, please use your current destination email as the username and create a "+
                              "password. After logging in, use the event code provided below to get to the event.\n\n" +
                              "Event Code: " + event.evt_id + "\n\nAlso, attached is a criteria page. We look forward to " +
                              "hearing from you soon.\n\nThank you,\n\nScored! Administration";
                $rootScope.sendEmail("contactus.scored@gmail.com", event.judges, "Judging!", message);

                if ($rootScope.currentUserData.user.user_role.indexOf(USER_ROLES.evt_admin) < 0)
                    $rootScope.currentUserData.user.user_role.push(USER_ROLES.evt_admin);

                UserService.updateUser($rootScope.currentUserData.user).then(function(res) {
                    alert('Your event was added at ' + res.data.timestamp);
                    $location.path('/home');
                }, function(res) {
                    $rootScope.stopAndReport(res.data);
                });
            }, function(res){
                $rootScope.stopAndReport(res.data);
            });
        }

        function formatAMPM(date) {
            var hours = date.getHours();
            var minutes = date.getMinutes();
            var ampm = hours >= 12 ? 'PM' : 'AM';
            hours = hours % 12;
            hours = hours ? hours : 12; // the hour '0' should be '12'
            minutes = minutes < 10 ? '0'+minutes : minutes;
            var strTime = hours + ':' + minutes + ' ' + ampm;
            return strTime;
        }

        $scope.addJudge = function(evt) {
            evt.preventDefault();

            $scope.number_of_judges++;

            var el = document.createElement('div');
            var divIDName = 'judge-' + $scope.number_of_judges;
            el.setAttribute('id', divIDName);
            el.setAttribute('class', 'form-group');
            el.innerHTML = '<button data-ng-click="removeJudge($event,' + $scope.number_of_judges + ');" class="btn btn-info">-</button> <input type="text" placeholder="full name" name="name" class="input" required> <input type="email" placeholder="youremail@email.com" name="email" class="input" required>';

            var temp = $compile(el)($scope);
            angular.element(document.querySelector('#judges')).append(temp);
        }

        $scope.removeJudge = function(evt, num) {
            evt.preventDefault();

            $scope.number_of_judges--;

            var j = document.getElementById('judges');
            var delDiv = document.getElementById('judge-' + num);
            j.removeChild(delDiv);
        }

        function failed(res) {
            $rootScope.stopAndReport(res.data);
        }

        $scope.addCriteria= function(evt){
            evt.preventDefault();

            $scope.number_of_criteria++;
            var el = document.createElement('div');
            var divIDName = 'jcrit-' + $scope.number_of_criteria;
            el.setAttribute('id', divIDName);
            el.setAttribute('class', 'form-group');
            el.innerHTML = '<button data-ng-click="removeCriteria($event,' + $scope.number_of_criteria + ');" class="btn btn-info">-</button> <input type="text" placeholder="Criteria" name="criterion" class="input" required>';

            var temp = $compile(el)($scope);
            angular.element(document.querySelector('#jcrit')).append(temp);
        }

        $scope.removeCriteria = function(evt, num) {
            evt.preventDefault();

            $scope.number_of_criteria--;

            var j = document.getElementById('jcrit');
            var delDiv = document.getElementById('jcrit-' + num);
            j.removeChild(delDiv);
        }

        $scope.checkDate = function(startDate,endDate) {
            $scope.errMessage = '';
            var curDate = new Date();

            if(new Date(startDate) > new Date(endDate)){
               alert ("End date should not be before Start Date.");
            }
            if(new Date(startDate) < curDate){
               alert ("Start date should not be before today.");
            }
        };
    }
]);