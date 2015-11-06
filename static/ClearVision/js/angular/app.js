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
    'app.config',
    'ngRoute',
    'single.click',
    'appointment.service',
    'ngAnimate',
    'colorpicker.module',
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
    'populate.patients',
    'get.timings',
    'show.form',
    'search.appointments',
    'check.existingPatient',
    'change.calendar',
    'get.marketingChannels',
    'doowb.angular-pusher',
    'get.stackedChart',
    'get.pieChart',
    'get.customStackedChart',
    'schedule.customFilter',
    'post.blocker',
    'app.expenditure',
    'ngProgress',
    'cgNotify',
    'show.notifications',
    'populate.blockedForm',
    'get.swappableAppointments',
    'treasure-overlay-spinner',
    'get.doctors',
    'get.clinics',
    'filterDate',
    'get.appointmentTypes',
    'ui.slider'
]);

/* Angular routing */
app.config(['$routeProvider', function ($routeProvider) {
    $routeProvider
        .when("/", {
            templateUrl: "calendar.html",
            controller: 'CalendarCtrl',
            activetab: ''

        })
        .when("/dashboard/roi", {
            templateUrl: "roi.html",
            controller: 'DashboardCtrl',
            activetab: 'dashboard/roi'
        })
        .when("/dashboard/conversion", {
            templateUrl: "conversion.html",
            controller: 'ConversionCtrl',
            activetab: 'dashboard/conversion'
        })
        .when("/dashboard/schedule", {
            templateUrl: "schedule.html",
            controller: 'AppointmentAnalysisCtrl',
            activetab: 'dashboard/schedule'
        })
        .when("/dashboard/expenditure", {
            templateUrl: "expenditure.html",
            controller: 'MarketingExpenditureCtrl',
            activetab: 'dashboard/expenditure'
        })
        .when("/waitlist", {
            templateUrl: "waitlist.html",
            controller: 'waitListCtrl',
            activetab: 'waitlist'
        })
        .when("/changepw", {
            templateUrl: "changepw.html",
            controller: 'adminCtrl'
        })
        .when("/queue", {
            templateUrl: "queue.html",
            controller: 'QueueCtrl',
            activetab: 'queue'
        })
        .when("/msglog", {
            templateUrl: "msglog.html",
            controller: 'msgCtrl'
        })
        .when("/adminconfig", {
            templateUrl: "adminconfig.html",
            controller: 'configCtrl',
            activetab: 'adminconfig'
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

app.config(['PusherServiceProvider', function (PusherServiceProvider) {
    PusherServiceProvider
        .setToken('6cb577c1e7b97150346b')
        .setOptions({});
}]);

app.run(function ($rootScope) {
    var date = new Date();
    $rootScope.month = date.getMonth() + 1;
});


//angular.module('calendarDemoApp').run(run);
//run.$inject = ['$rootScope'];

//function run($rootScope) {
//    $rootScope.spinner = {active: true};
//}


//remove ng-scope and ng-bining class from html
/*app.config(['$compileProvider', function ($compileProvider) {
 $compileProvider.debugInfoEnabled(false);
 }]);*/