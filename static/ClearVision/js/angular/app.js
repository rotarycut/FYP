var app = angular.module('calendarDemoApp', [
    'ui.calendar',
    'ui.bootstrap',
    'app.calendar',
    'app.dashboard',
    'ngRoute',
    'single.click',
    'appointment.service',
    'ngAnimate',
    'angular.filter'
]);

/* Angular routing */
app.config(['$routeProvider', function ($routeProvider) {
    $routeProvider
        .when("/", {
            templateUrl: "calendar.html",
            controller: 'CalendarCtrl'
        })
        .when("/dashboard", {
            templateUrl: "dashboard.html",
            controller: 'DashboardCtrl'
        })
        .when("/waitlist", {
            templateUrl: "waitlist.html",
            controller: ''
        })
        .otherwise({
            redirectTo: '/'
        });
}]);

/* Changing Angular interpolation from "{{ }}" to "[[ ]]" to prevent conflict with Django codes */
app.config(function ($interpolateProvider) {
    $interpolateProvider.startSymbol('[[');
    $interpolateProvider.endSymbol(']]');
});

//remove ng-scope and ng-bining class from html
/*app.config(['$compileProvider', function ($compileProvider) {
 $compileProvider.debugInfoEnabled(false);
 }]);*/