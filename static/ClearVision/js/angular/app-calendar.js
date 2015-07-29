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

    $scope.drHoScreenings = {
        color: '#303030',
        textColor: 'White',
        events: []
    };

    $scope.drHoPreEvaluations = {
        color: '#CC6600',
        textColor: 'White',
        events: []
    };

    $scope.drHoSurgeries = {
        color: '#CC3333',
        textColor: 'White',
        events: []
    };

    $scope.drGohScreenings = {
        color: '#303030',
        textColor: 'White',
        events: []
    };

    $scope.drGohPreEvaluations = {
        color: '#CC6600',
        textColor: 'White',
        events: []
    };

    $scope.drGohSurgeries = {
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
    $scope.renderCalendar = function (calendarId) {
        $timeout(function () {
            calendarTag = $('#' + calendarId);
            calendarTag.fullCalendar('render');
            //$('#calendar').fullCalendar('rerenderEvents');
        }, 0);
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
    $scope.doctorHoAppointments = [$scope.drHoScreenings, $scope.drHoPreEvaluations, $scope.drHoSurgeries];
    $scope.doctorGohAppointments = [$scope.drGohScreenings, $scope.drGohPreEvaluations, $scope.drGohSurgeries];

    //Async http get request to retrieve Dr Ho's screening appointments
    $scope.getDrHoScreenings = function () {

        $http.get('http://demo4552602.mockable.io/drHoScreenings')

            .success(function (listOfAppointments) {
                var drHoScreenings = listOfAppointments;
                angular.forEach(drHoScreenings, function (screeningAppointment) {
                    $scope.drHoScreenings.events.push(screeningAppointment);
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
                    $scope.drHoPreEvaluations.events.push(preEvaluationAppointment);
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
                    $scope.drHoSurgeries.events.push(surgeryAppointment);
                })
            })

            .error(function () {
                console.log("Error getting Dr Ho's surgery appointments");
            });
    };

    //Async http get request to retrieve Dr Goh's screening appointments
    $scope.getDrGohScreenings = function () {
        $scope.drGohScreenings.events.splice(0);
        $http.get('http://demo4552602.mockable.io/drGohScreenings')

            .success(function (listOfAppointments) {
                var drGohScreenings = listOfAppointments;
                angular.forEach(drGohScreenings, function (screeningAppointment) {
                    $scope.drGohScreenings.events.push(screeningAppointment);
                })
            })

            .error(function () {
                console.log("Error getting Dr Goh's screening appointments");
            });
    };

    //Async http get request to retrieve Dr Goh's pre-evaluation appointments
    $scope.getDrGohPreEvaluations = function () {
        $scope.drGohPreEvaluations.events.splice(0);
        $http.get('http://demo4552602.mockable.io/drGohPreEvaluations')

            .success(function (listOfAppointments) {
                var drGohPreEvaluations = listOfAppointments;
                angular.forEach(drGohPreEvaluations, function (preEvaluationAppointment) {
                    $scope.drGohPreEvaluations.events.push(preEvaluationAppointment);
                })
            })

            .error(function () {
                console.log("Error getting Dr Goh's pre-evaluation appointments");
            });
    };

    //Async http get request to retrieve Dr Goh's surgery appointments
    $scope.getDrGohSurgeries = function () {
        $scope.drGohSurgeries.events.splice(0);
        $http.get('http://demo4552602.mockable.io/drGohSurgeries')

            .success(function (listOfAppointments) {
                var drGohSurgeries = listOfAppointments;
                angular.forEach(drGohSurgeries, function (surgeryAppointment) {
                    $scope.drGohSurgeries.events.push(surgeryAppointment);
                })
            })

            .error(function () {
                console.log("Error getting Dr Goh's surgery appointments");
            });
    };


    //Testing: Post request
    $scope.postAppointment = function () {

        $http.post('/Clearvision/_api/appointmentsCUD/', {
            "type": "Pre Evaluation",
            "start": "2015-07-28T07:16:35Z",
            "end": "2015-07-28T07:30:35Z",
            "creation_time": "2015-07-28T07:16:36Z",
            "doctor": 1,
            "clinic": 2,
            "patients": [
                91500323,
                94764232
            ]
        })

            .success(function (data) {
                console.log("Successful with http post");
                console.log(data);

                var event = data;

                $scope.drHoPreEvaluations.events.push(event);
            })

            .error(function (data) {
                console.log("Error with http post");
            });

    };


    //Testing: Delete request
    $scope.deleteAppointment = function () {

        $http.delete('/Clearvision/_api/appointmentsCUD/1')
            .success(function (data) {
                console.log("Successfully deleted");
            });

    };


    //Testing : Updating request
    $scope.updateAppointment = function () {

        $scope.updateJson = {
            "id": 2,
            "start": "2015-07-22T07:16:35Z"
        };

        $http.patch('/Clearvision/_api/appointmentsCUD/2', $scope.updateJson)
            .success(function (data) {
                console.log("Successfully updated");
            });
    };

    /* Start of date picker codes */
    $scope.datepickers = {
        showDatePicker: false
    };
    $scope.disabled = function(date, mode) {
    return ( mode === 'day' && ( date.getDay() === 0 || date.getDay() === 7 ) );
    };

    $scope.today = function () {
        $scope.datePickerCalendar = new Date();
    };
    $scope.today();

    $scope.clear = function () {
        $scope.datePickerCalendar = null;
    };

    $scope.toggleMin = function () {
        $scope.minDate = $scope.minDate ? null : new Date();
    };
    $scope.toggleMin();

    $scope.open = function ($event, which) {
        $event.preventDefault();
        $event.stopPropagation();

        $scope.datepickers[which] = true;
    };

    $scope.dateOptions = {
        formatYear: 'yy',
        startingDay: 1,
        showWeeks: 'false'
    };

    $scope.formats = ['dd-MMMM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
    $scope.format = $scope.formats[0];
    /* End of date picker codes */


    $scope.listOfAppointmentTypes = ["Pre-Evaluation", "Lasik Surgery", "Screening", "Follow-up"];

    $scope.listOfAppointmentTimings = ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00"];

    $scope.listOfMarketingChannels = ["Email", "Friend", "Facebook Advertisement", "Clearvision Website"];

    $scope.listOfTimeslotPatients = ["Amabel Lau", "Leon Lim", "Sherman Yong"];

    $scope.clearForm = function () {
        $scope.appointmentType = "";
        $scope.apptDateTime = "";
        $scope.appointmentTime = "";
        $scope.patientName = "";
        $scope.patientContact = "";
        $scope.doctorAssigned = "";
        $scope.marketingChannel = "";
        $scope.appointmentRemarks = "";
    };
    $scope.showForm = function () {
        $scope.formAnimation = "form-container-show";
        $scope.calAnimation = "cal-container-resize";
        $scope.topAnimation = "top-container-resize";
    };

    $scope.hideForm = function () {
        $scope.formAnimation = "form-container";
        $scope.calAnimation = "cal-container";
        $scope.topAnimation = "top-container";
    };


});