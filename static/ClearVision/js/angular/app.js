var app = angular.module('calendarDemoApp', [
    'ui.calendar',
    'ui.bootstrap',
    'app.calendar',
    'app.dashboard',
    'app.waitingList',
    'app.admin',
    'ngRoute',
    'single.click',
    'appointment.service',
    'ngAnimate',
    'angular.filter',
    'post.appointment',
    'clear.form',
    'disable.ISchedule',
    'delete.appointment',
    'update.appointment',
    'hide.form',
    'update.notification.count',
    'get.notifications'
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
            controller: 'waitListCtrl'
        })
        .when("/changepw", {
            templateUrl: "changepw.html",
            controller: 'adminCtrl'
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