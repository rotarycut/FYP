var appCalendar = angular.module('app.calendar', []);


appCalendar.controller('CalendarCtrl', function ($scope, $compile, uiCalendarConfig, $timeout, $http) {

    var date = new Date();
    var d = date.getDate();
    var m = date.getMonth();
    var y = date.getFullYear();

    $scope.changeTo = 'Hungarian';
    /* event source that pulls from google.com */
    $scope.eventSource = {
        url: "http://www.google.com/calendar/feeds/usa__en%40holiday.calendar.google.com/public/basic",
        className: 'gcal-event',           // an option!
        currentTimezone: 'America/Chicago' // an option!
    };
    /* event source that contains custom events on the scope */

    /*$scope.events = [
     {
     id: 1,
     title: 'Mabel Appt',
     start: new Date("July 13, 2015 11:15:00"),
     end: new Date("July 13, 2015 11:30:00")
     },
     {
     id: 2,
     title: 'Sherman Appt',
     start: new Date("July 13, 2015 11:30:00"),
     end: new Date("July 13, 2015 11:45:00")
     },
     {
     id: 3,
     title: 'Carina Appt',
     start: new Date("July 13, 2015 12:30:00"),
     end: new Date("July 13, 2015 12:45:00")
     },
     {
     id: 4,
     title: 'Sim Appt',
     start: new Date("July 21, 2015 12:30:00"),
     end: new Date("July 21, 2015 12:45:00")
     },
     {
     id: 5,
     title: 'Jane Appt',
     start: new Date("July 17, 2015 11:30:00"),
     end: new Date("July 17, 2015 11:45:00")
     },
     {
     id: 6,
     title: 'Apple Appt',
     start: new Date("July 17, 2015 12:00:00"),
     end: new Date("July 17, 2015 12:30:00")
     },
     {
     id: 7,
     title: 'Bob Appt',
     start: new Date("July 26, 2015 16:30:00"),
     end: new Date("July 26, 2015 16:45:00")
     }
     ];*/

    $scope.screenings = {
        color: '#303030',
        textColor: 'White',
        events: []
    };

    $scope.preEvaluations = {
        color: '#CC6600',
        textColor: 'White',
        events: []
    };

    $scope.surgeries = {
        color: '#CC3333',
        textColor: 'White',
        events: []
    };

    /* event source that calls a function on every view switch */
    $scope.eventsF = function (start, end, timezone, callback) {
        var s = new Date(start).getTime() / 1000;
        var e = new Date(end).getTime() / 1000;
        var m = new Date(start).getMonth();
        var events = [{
            title: 'Feed Me ' + m,
            start: s + (50000),
            end: s + (100000),
            allDay: false,
            className: ['customFeed']
        }];
        callback(events);
    };

    $scope.calEventsExt = {
        color: '#f00',
        textColor: 'yellow',
        events: [
            {
                type: 'party',
                title: 'Lunch',
                start: new Date(y, m, d, 12, 0),
                end: new Date(y, m, d, 14, 0),
                allDay: false
            },
            {
                type: 'party',
                title: 'Lunch 2',
                start: new Date(y, m, d, 12, 0),
                end: new Date(y, m, d, 14, 0),
                allDay: false
            },
            {
                type: 'party',
                title: 'Click for Google',
                start: new Date(y, m, 28),
                end: new Date(y, m, 29),
                url: 'http://google.com/'
            }
        ]
    };

    /* alert on eventClick */
    $scope.alertOnEventClick = function (date, jsEvent, view) {
        $scope.alertMessage = (date.title + ' was clicked ');
    };

    /* alert on Drop */
    $scope.alertOnDrop = function (event, delta, revertFunc, jsEvent, ui, view) {
        //$scope.alertMessage = ('Event Droped to make dayDelta ' + delta);
        $scope.alertMessage = ("Successfully Changed Appointment");

        $timeout(function () {
            $scope.alertMessage = ("");
        }, 1000);

    };

    /* alert on Resize */
    $scope.alertOnResize = function (event, delta, revertFunc, jsEvent, ui, view) {
        //$scope.alertMessage = ('Event Resized to make dayDelta ' + delta);

        $scope.alertMessage = ("Successfully Re-sized Appointment");

        $timeout(function () {
            $scope.alertMessage = ("");
        }, 1000);
    };

    /* add and removes an event source of choice */
    $scope.addRemoveEventSource = function (sources, source) {
        var canAdd = 0;
        angular.forEach(sources, function (value, key) {
            if (sources[key] === source) {
                sources.splice(key, 1);
                canAdd = 1;
            }
        });
        if (canAdd === 0) {
            sources.push(source);
        }
    };

    /* add custom event*/
    $scope.addEvent = function () {
        $scope.events.push({
            title: 'Open Sesame',
            start: new Date(y, m, 28),
            end: new Date(y, m, 29),
            className: ['openSesame']
        });
    };

    /* remove event */
    $scope.remove = function (index) {
        $scope.events.splice(index, 1);
    };

    /* Change View */
    $scope.changeView = function (view, calendar) {
        uiCalendarConfig.calendars[calendar].fullCalendar('changeView', view);
    };

    /* Change View */
    $scope.renderCalender = function (calendar) {
        if (uiCalendarConfig.calendars[calendar]) {
            uiCalendarConfig.calendars[calendar].fullCalendar('render');
        }
    };

    /* Render Tooltip */
    $scope.eventRender = function (event, element, view) {
        var strOfPatientNames = $scope.getAllPatientsName(event);
        element.attr({
            'tooltip': strOfPatientNames,
            'tooltip-append-to-body': true
        });
        $compile(element)($scope);
    };

    /* Returns a string of patient names for a particular appointment time slot */
    $scope.getAllPatientsName = function (event, element) {

        var listOfPatients = event.patients;
        var strOfPatientNames = "";

        listOfPatients.forEach(function (patient) {
            strOfPatientNames += patient.name;
            strOfPatientNames += '\r\n';
        });

        return strOfPatientNames;
    };

    /* config object */
    $scope.uiConfig = {
        calendar: {
            height: 650,
            editable: true,
            header: {
                left: 'title',
                center: '',
                right: 'today prev,next'
            },
            minTime: "08:00",
            maxTime: "21:00",
            fixedWeekCount: false,
            eventClick: $scope.alertOnEventClick,
            eventDrop: $scope.alertOnDrop,
            eventResize: $scope.alertOnResize,
            eventRender: $scope.eventRender
        }
    };

    $scope.changeLang = function () {
        if ($scope.changeTo === 'Hungarian') {
            $scope.uiConfig.calendar.dayNames = ["Vasárnap", "Hétfő", "Kedd", "Szerda", "Csütörtök", "Péntek", "Szombat"];
            $scope.uiConfig.calendar.dayNamesShort = ["Vas", "Hét", "Kedd", "Sze", "Csüt", "Pén", "Szo"];
            $scope.changeTo = 'English';
        } else {
            $scope.uiConfig.calendar.dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
            $scope.uiConfig.calendar.dayNamesShort = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
            $scope.changeTo = 'Hungarian';
        }
    };

    /* event sources array*/
    $scope.doctorHoAppointments = [$scope.screenings, $scope.preEvaluations, $scope.surgeries];
    $scope.doctorGohAppointments = [$scope.calEventsExt, $scope.eventsF];

    //Asynchronous HTTP Get will be called when the app starts
    $http.get('/Clearvision/_api/appointments/')
        .success(function (data) {

            $scope.events = data;
            //In the web console, $scope.events now contains all the objects from the HTTP Get Request
            console.log($scope.events);

            $scope.eventSources = [$scope.events, $scope.surgeries, $scope.eventsF];
            //In the web console, $scope.eventSources now contains all the objects from the HTTP Get Request
            console.log($scope.eventSources);

            //However, in the view, the $scope.eventSources is not updated with the new objects

            //For Testing: Even if I run this line of code below, the $scope.eventSources still show $scope.surgeries and $scope.eventsF
            $scope.eventSources = [];

            //For Testing: Even forcing a digest loop does not update the $scope.eventSources
            $timeout(function () {

                $scope.$apply(function () {
                    $scope.eventSources = [];
                });
            }, 2000)

        }).error(function (data) {

        });


    //For Testing: However, when I run this line of code below, the $scope.eventSources now do not show $scope.surgeries and $scope.eventsF
    //$scope.eventSources = [];

    //Async http get request to retrieve Dr Ho's screening appointments
    $scope.getDrHoScreenings = function () {

        $http.get('http://demo4552602.mockable.io/drHoScreenings')

            .success(function (listOfAppointments) {
                var drHoScreenings = listOfAppointments;
                angular.forEach(drHoScreenings, function (screeningAppointment) {
                    $scope.screenings.events.push(screeningAppointment);
                })
            })

            .error(function () {
                console.log("Error getting Dr Ho's screening appointments");
            });
    };

    //Async http get request to retrieve Dr Ho's pre-evaluation appointments
    $scope.getDrHoPreEvaluations = function () {

        $http.get('http://demo4552602.mockable.io/drHoPreEvaluations')

            .success(function (listOfAppointments) {
                var drHoPreEvaluations = listOfAppointments;
                angular.forEach(drHoPreEvaluations, function (preEvaluationAppointment) {
                    $scope.preEvaluations.events.push(preEvaluationAppointment);
                })
            })

            .error(function () {
                console.log("Error getting Dr Ho's pre-evaluation appointments");
            });
    };

    //Async http get request to retrieve Dr Ho's surgery appointments
    $scope.getDrHoSurgeries = function () {

        $http.get('http://demo4552602.mockable.io/drHoSurgeries')

            .success(function (listOfAppointments) {
                var drHoSurgeries = listOfAppointments;
                angular.forEach(drHoSurgeries, function (surgeryAppointment) {
                    $scope.surgeries.events.push(surgeryAppointment);
                })
            })

            .error(function () {
                console.log("Error getting Dr Ho's surgery appointments");
            });
    };

});
