var appCalendar = angular.module('app.calendar', []);


appCalendar.controller('CalendarCtrl', function ($scope, $compile, uiCalendarConfig, $timeout, $http) {

    var date = new Date();
    var d = date.getDate();
    var m = date.getMonth();
    var y = date.getFullYear();

    $scope.apptFormBtns = true;


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

    $scope.lowHeatMap = {
        color: '#33CC00',
        textColor: 'White',
        events: []
    };

    $scope.medHeatMap = {
        color: '#FF9966',
        textColor: 'White',
        events: []
    };

    $scope.highHeatMap = {
        color: '#FF0000',
        textColor: 'White',
        events: []
    };

    $scope.getLowHeatMap = function () {

        $http.get('http://demo4552602.mockable.io/lowHeatmap')

            .success(function (listOfAppointments) {
                var lowHeatMap = listOfAppointments;

                $timeout(function () {
                    angular.forEach(lowHeatMap, function (appointment) {
                        $scope.lowHeatMap.events.push(appointment);
                    })
                }, 200);

            })

            .error(function () {
                console.log("Error getting low heat map");
            });
    };

    $scope.getMedHeatMap = function () {

        $http.get('http://demo4552602.mockable.io/medHeatmap')

            .success(function (listOfAppointments) {
                var medHeatMap = listOfAppointments;

                $timeout(function () {
                    angular.forEach(medHeatMap, function (appointment) {
                        $scope.medHeatMap.events.push(appointment);
                    })
                }, 200);

            })

            .error(function () {
                console.log("Error getting med heat map");
            });
    };

    $scope.getHighHeatMap = function () {

        $http.get('http://demo4552602.mockable.io/highHeatmap')

            .success(function (listOfAppointments) {
                var highHeatMap = listOfAppointments;

                $timeout(function () {
                    angular.forEach(highHeatMap, function (appointment) {
                        $scope.highHeatMap.events.push(appointment);
                    })
                }, 200);

            })

            .error(function () {
                console.log("Error getting high heat map");
            });
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
    $scope.alertOnEventClick = function (appointment, jsEvent, view) {
        $scope.alertMessage = (appointment.title + ' was clicked ');
        $scope.clearForm();
        $scope.showForm();
        $scope.appointmentId = appointment.id;
        $scope.formTitle = "Edit Appointment";
        $scope.showPatientList = true;
        $scope.showDeleteButton = true;
        $scope.showEditButton = true;
        $scope.showSubmitButton = false;
        $scope.patientList = appointment.patients;
        $scope.appointmentType.value = appointment.type;
        $scope.apptDateTime = appointment.date;
        $scope.apptFullTime = appointment.start._i;

        var space = $scope.apptFullTime.lastIndexOf(" ") + 1;
        var colon = $scope.apptFullTime.lastIndexOf(":");
        $scope.appointmentTime.value = $scope.apptFullTime.substring(space, colon);

        $scope.disablePatientNameInput = true;
        $scope.disablePatientContactInput = true;
        $scope.disableAssignedDoctorInput = true;
        $scope.disableMktgChannelInput = true;
        $('#drHoCalendar').fullCalendar('gotoDate', appointment.date);
        $('#drHoCalendar').fullCalendar('select', appointment.date);

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
        console.log(element);
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

    /* changing of calendar language, if we need to use */
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
    $scope.doctorHoAppointments = [$scope.drHoScreenings, $scope.drHoPreEvaluations, $scope.drHoSurgeries, $scope.lowHeatMap, $scope.medHeatMap, $scope.highHeatMap];
    $scope.doctorGohAppointments = [$scope.drGohScreenings, $scope.drGohPreEvaluations, $scope.drGohSurgeries];

    //Async http get request to retrieve Dr Ho's screening appointments
    $scope.getDrHoScreenings = function () {

        $http.get('/Clearvision/_api/appointments/?doctor__name=Dr%20Ho&type=Screening')

            .success(function (listOfAppointments) {
                var drHoScreenings = listOfAppointments;

                $timeout(function () {
                    angular.forEach(drHoScreenings, function (screeningAppointment) {
                        $scope.drHoScreenings.events.push(screeningAppointment);
                    })
                }, 200);

            })

            .error(function () {
                console.log("Error getting Dr Ho's screening appointments");
            });
    };

    //Async http get request to retrieve Dr Ho's pre-evaluation appointments
    $scope.getDrHoPreEvaluations = function () {

        $http.get('/Clearvision/_api/appointments/?doctor__name=Dr%20Ho&type=Pre%20Evaluation')

            .success(function (listOfAppointments) {
                var drHoPreEvaluations = listOfAppointments;

                $timeout(function () {
                    angular.forEach(drHoPreEvaluations, function (preEvaluationAppointment) {
                        $scope.drHoPreEvaluations.events.push(preEvaluationAppointment);
                    })
                }, 200);

            })

            .error(function () {
                console.log("Error getting Dr Ho's pre-evaluation appointments");
            });
    };

    //Async http get request to retrieve Dr Ho's surgery appointments
    $scope.getDrHoSurgeries = function () {

        $http.get('/Clearvision/_api/appointments/?doctor__name=Dr%20Ho&type=Surgery')

            .success(function (listOfAppointments) {
                var drHoSurgeries = listOfAppointments;

                $timeout(function () {
                    angular.forEach(drHoSurgeries, function (surgeryAppointment) {
                        $scope.drHoSurgeries.events.push(surgeryAppointment);
                    })
                }, 200);

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

    //Post appointment
    $scope.postAppointment = function () {

        var year = $scope.apptDateTime.getFullYear();

        var month = $scope.apptDateTime.getMonth() + 1;
        if (month <= 9) {
            month = '0' + month;
        }

        var day = $scope.apptDateTime.getDate();
        if (day <= 9) {
            day = '0' + day;
        }

        $scope.formattedDate = year + '-' + month + '-' + day;

        $http.post('/Clearvision/_api/appointmentsCUD/', {
            "type": $scope.appointmentType.value.trim(),
            "date": $scope.formattedDate,
            "docID": $scope.doctorAssigned,
            "clinicID": 1,
            "contact": $scope.patientContact,
            "name": $scope.patientName,
            "gender": "Male",
            "channelID": "1",
            "time": $scope.appointmentTime.value.trim()
        })
            .success(function (data) {
                console.log("Successful with http post");
                console.log(data);

                var event = data;

                switch ($scope.appointmentType.value.trim()) {

                    case "Screening":
                        var appointmentIndex = 0;
                        angular.forEach($scope.drHoScreenings.events, function (screeningAppointment) {
                            if (screeningAppointment.start === event.start) {
                                $scope.drHoScreenings.events.splice(appointmentIndex, 1);

                            }
                            appointmentIndex++;
                        });
                        $scope.drHoScreenings.events.push(event);
                        break;

                    case "Pre Evaluation":
                        var appointmentIndex = 0;
                        angular.forEach($scope.drHoPreEvaluations.events, function (preEvaluationAppointment) {
                            if (preEvaluationAppointment.start === event.start) {
                                $scope.drHoPreEvaluations.events.splice(appointmentIndex, 1);

                            }
                            appointmentIndex++;
                        });
                        $scope.drHoPreEvaluations.events.push(event);
                        break;

                    case "Surgery":
                        var appointmentIndex = 0;
                        angular.forEach($scope.drHoSurgeries.events, function (surgeryAppointment) {
                            if (surgeryAppointment.start === event.start) {
                                $scope.drHoSurgeries.events.splice(appointmentIndex, 1);

                            }
                            appointmentIndex++;
                        });

                        $scope.drHoSurgeries.events.push(event);
                        break;
                }

            })

            .error(function (data) {
                console.log("Error with http post");
            });

    };

    //Delete appointment
    $scope.deleteAppointment = function () {

        var urlStr = '/Clearvision/_api/appointmentsCUD/' + $scope.appointmentId;

        var req = {
            method: 'DELETE',
            url: urlStr,
            headers: {'Content-Type': 'application/json'},
            data: {
                "contact": $scope.patientContact
            }
        };

        $http(req)
            .success(function (data) {
                console.log("Successfully deleted");
                console.log(data);
                var event = data;

                switch ($scope.appointmentType.value.trim()) {

                    case "Screening":
                        var appointmentIndex = 0;
                        angular.forEach($scope.drHoScreenings.events, function (screeningAppointment) {
                            if (screeningAppointment.id === $scope.appointmentId) {
                                $scope.drHoScreenings.events.splice(appointmentIndex, 1);

                            }
                            appointmentIndex++;
                        });
                        if (event != '{}') {
                            $scope.drHoScreenings.events.push(event);
                        }
                        break;

                    case "Pre Evaluation":
                        var appointmentIndex = 0;
                        angular.forEach($scope.drHoPreEvaluations.events, function (preEvaluationAppointment) {
                            if (preEvaluationAppointment.id === $scope.appointmentId) {
                                $scope.drHoPreEvaluations.events.splice(appointmentIndex, 1);

                            }
                            appointmentIndex++;
                        });
                        if (event != '{}') {
                            $scope.drHoPreEvaluations.events.push(event);
                        }
                        break;

                    case "Surgery":
                        var appointmentIndex = 0;
                        angular.forEach($scope.drHoSurgeries.events, function (surgeryAppointment) {
                            if (surgeryAppointment.id === $scope.appointmentId) {
                                $scope.drHoSurgeries.events.splice(appointmentIndex, 1);

                            }
                            appointmentIndex++;
                        });
                        if (event != '{}') {
                            $scope.drHoSurgeries.events.push(event);
                            break;
                        }
                }

            })

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
    $scope.disabled = function (date, mode) {
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

    /* Appointment form configuration */
    $scope.formTitle = "Create New Appointment";
    $scope.showPatientList = false;
    $scope.showDeleteButton = false;
    $scope.showEditButton = false;
    $scope.showSubmitButton = true;
    $scope.showResetButton = true;
    $scope.remarkWarning = "Please select a patient";

    /* Populate patient details upon selection */
    $scope.populatePatientDetails = function () {
        var patientName = $scope.appointmentPatient.trim();

        angular.forEach($scope.patientList, function (patient) {
            if (patientName === patient.name) {
                $scope.patientName = patient.name;
                $scope.patientContact = patient.contact;
            }
        })
    };

    $scope.appointmentType = {
        value: "",
        list: ["Screening", "Pre Evaluation", "Surgery"]
    };

    $scope.appointmentTime = {
        value: "",
        list: ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00"]
    };

    $scope.listOfMarketingChannels = ["Email", "Friend", "Facebook Advertisement", "Clearvision Website"];

    $scope.clearForm = function () {
        $scope.appointmentId = "";
        $scope.appointmentPatient = "";
        $scope.appointmentType.value = "";
        $scope.apptDateTime = "";
        $scope.appointmentTime.value = "";
        $scope.patientName = "";
        $scope.patientContact = "";
        $scope.doctorAssigned = "";
        $scope.marketingChannel = "";
        $scope.appointmentRemarks = "";
        $scope.disablePatientNameInput = false;
        $scope.disablePatientContactInput = false;
        $scope.disableAssignedDoctorInput = false;
        $scope.disableMktgChannelInput = false;
    };

    $scope.showForm = function () {
        $scope.leftAnimation = "col-sm-8 left-content-resize";
        $scope.rightAnimation = "col-sm-4 right-content-show";
        $scope.apptFormBtns = false;
        /*
        $scope.getLowHeatMap();
        $scope.getMedHeatMap();
        $scope.getHighHeatMap();
        $scope.drHoScreenings.events.splice(0);
        $scope.drHoPreEvaluations.events.splice(0);
        $scope.drHoSurgeries.events.splice(0);
        */
    };

    $scope.hideForm = function () {
        $scope.leftAnimation = "col-sm-12 left-content"
        $scope.rightAnimation = "col-sm-4 right-content"
        $scope.formTitle = "Create New Appointment";
        $scope.showPatientList = false;
        $scope.showDeleteButton = false;
        $scope.apptFormBtns = true;
        $scope.showEditButton = false;
        $scope.showSubmitButton = true;
        $scope.showResetButton=true;
        $scope.clearForm();

        /*
        $scope.lowHeatMap.events.splice(0);
        $scope.medHeatMap.events.splice(0);
        $scope.highHeatMap.events.splice(0);
        $scope.getDrHoScreenings();
        $scope.getDrHoPreEvaluations();
        $scope.getDrHoSurgeries();
        */

    };

});