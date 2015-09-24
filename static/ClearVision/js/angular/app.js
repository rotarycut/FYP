var app = angular.module('calendarDemoApp', [
    'ui.calendar',
    'ui.bootstrap',
    'app.calendar',
    'app.dashboard',
    'app.conversion',
    'app.appointmentAnalysis',
    'app.waitingList',
    'app.patientQueue',
    'app.msgLog',
    'app.admin',
    'ngRoute',
    'single.click',
    'appointment.service',
    'ngAnimate',
    'angular.filter',
    'post.appointment',
    'clear.form',
    'enable.ISchedule',
    'disable.ISchedule',
    'delete.appointment',
    'update.appointment',
    'hide.form',
    'update.notification.count',
    'get.notifications',
    'event.click',
    'get.noShow',
    'add.archive',
    'post.filter',
    'post.roiFilter',
    'edit.filter',
    'filter.appointment',
    'get.todayAppointments',
    'get.patientQueue',
    'SwampDragonServices',
    'populate.patients',
    'get.timings'
]);

/* Angular routing */
app.config(['$routeProvider', function ($routeProvider) {
    $routeProvider
        .when("/", {
            templateUrl: "calendar.html",
            controller: 'CalendarCtrl'
        })
        .when("/dashboard/roi", {
            templateUrl: "roi.html",
            controller: 'DashboardCtrl'
        })
        .when("/dashboard/conversion", {
            templateUrl: "conversion.html",
            controller: 'ConversionCtrl'
        })
        .when("/dashboard/schedule", {
            templateUrl: "schedule.html",
            controller: 'AppointmentAnalysisCtrl'
        })
        .when("/waitlist", {
            templateUrl: "waitlist.html",
            controller: 'waitListCtrl'
        })
        .when("/changepw", {
            templateUrl: "changepw.html",
            controller: 'adminCtrl'
        })
        .when("/queue", {
            templateUrl: "queue.html",
            controller: 'QueueCtrl'
        })
        .when("/msglog", {
            templateUrl: "msglog.html",
            controller: 'msgCtrl'
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