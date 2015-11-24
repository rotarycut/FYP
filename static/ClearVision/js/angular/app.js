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
    'app.kpi',
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
    'pusher-angular',
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
    'get.appointmentTypesColor',
    'ui.slider',
    'get.appointmentTypes',
    'get.calendarTimeRange',
    'get.calendarTimeRangeInterval',
    'app.managechannels',
    'get.monthListings',
    'schedule.conversionFilter',
    'get.marketingChannelsStatus',
    'get.roiFilter',
    'suggested.Appointments'
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
        .when("/dashboard/kpi", {
            templateUrl: "kpi.html",
            controller: 'KPICtrl',
            activetab: 'dashboard/kpi'
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
        .when("/dashboard/managechannels", {
            templateUrl: "managechannels.html",
            controller: 'ManageChannelsCtrl',
            activetab: 'dashboard/managechannels'
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

/* main method of angular app, runs when app starts */
app.run(function ($rootScope, $timeout, $pusher, $log, getSwapApptsSvc) {

    // get number of swappable appointments
    getSwapApptsSvc.getNumberOfSwappableAppointments();

    // set up pusher
    var client = new Pusher('6cb577c1e7b97150346b');
    $rootScope.pusher = $pusher(client);

    $timeout(function () {
        $rootScope.socketId = $rootScope.pusher.connection.baseConnection.socket_id;
    }, 5000);

    // get current date
    var date = new Date();
    $rootScope.month = date.getMonth() + 1;

    // pusher for create doctor
    var createDoctorChannel = $rootScope.pusher.subscribe('freezeinstances');

    createDoctorChannel.bind('statusupdate', function (response) {

        if (response.message == true) {
            $rootScope.spinner = {active: true};

        } else if (response.message == false) {
            $rootScope.spinner = {active: false};
        }

        $log.debug("Receiving socket request to create doctor");
    });

});