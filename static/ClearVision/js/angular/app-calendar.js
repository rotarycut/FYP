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

    /* --- start of declaration of event source that contains custom events on the scope --- */
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
    /* --- end of declaration --- */

    /* function to retrieve low heat map for iSchedule */
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

    /* function to retrieve medium heat map for iSchedule */
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

    /* function to retrieve high heat map for iSchedule */
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

    /* alert on eventClick */
    $scope.alertOnEventClick = function (appointment, jsEvent, view) {
        $scope.clearForm();
        $scope.alertMessage = (appointment.title + ' was clicked ');
        $scope.fields.appointmentId = appointment.id;
        $scope.fields.patientList = appointment.patients;
        $scope.fields.appointmentType = appointment.type;
        $scope.fields.appointmentDate = appointment.date;

        var appointmentFullDateTime = appointment.start._i;
        var spaceIndex = appointmentFullDateTime.lastIndexOf(" ") + 1;
        var colonIndex = appointmentFullDateTime.lastIndexOf(":");
        $scope.fields.appointmentTime = appointmentFullDateTime.substring(spaceIndex, colonIndex);

        $('#drHoCalendar').fullCalendar('gotoDate', appointment.date);
        $('#drHoCalendar').fullCalendar('select', appointment.date);

        $scope.showForm('Edit');
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

    /* add custom event */
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

    /* change calendar view */
    $scope.changeView = function (view, calendar) {
        uiCalendarConfig.calendars[calendar].fullCalendar('changeView', view);
    };

    /* render calendar */
    $scope.renderCalendar = function (calendarId) {
        $timeout(function () {
            calendarTag = $('#' + calendarId);
            calendarTag.fullCalendar('render');
            //$('#calendar').fullCalendar('rerenderEvents');
        }, 0);
    };

    /* render tooltip */
    $scope.eventRender = function (event, element, view) {
        var strOfPatientNames = $scope.getAllPatientsName(event);
        element.attr({
            'tooltip': strOfPatientNames,
            'tooltip-append-to-body': true
        });
        $compile(element)($scope);
    };

    /* function which returns a string of patient names for the particular appointment time slot */
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

    /* event sources array */
    $scope.doctorHoAppointments = [$scope.drHoScreenings, $scope.drHoPreEvaluations, $scope.drHoSurgeries, $scope.lowHeatMap, $scope.medHeatMap, $scope.highHeatMap];
    $scope.doctorGohAppointments = [$scope.drGohScreenings, $scope.drGohPreEvaluations, $scope.drGohSurgeries];

    /* function to retrieve dr ho's screening appointments */
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

    /* function to retrieve dr ho's pre-evaluation appointments */
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

    /* function to retrieve dr ho's surgery appointments */
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

    /* function to retrieve dr goh's screening appointments */
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

    /* function to retrieve dr goh's pre-evaluation appointments */
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

    /* function to retrieve dr goh's surgery appointments */
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

    /* function to create appointment */
    $scope.postAppointment = function (formIsValid) {

        if (formIsValid) {
            var year = $scope.fields.appointmentDate.getFullYear();

            var month = $scope.fields.appointmentDate.getMonth() + 1;
            if (month <= 9) {
                month = '0' + month;
            }

            var day = $scope.fields.appointmentDate.getDate();
            if (day <= 9) {
                day = '0' + day;
            }

            $scope.formattedDate = year + '-' + month + '-' + day;

            $http.post('/Clearvision/_api/appointmentsCUD/', {
                "type": $scope.fields.appointmentType,
                "date": $scope.formattedDate,
                "docID": $scope.fields.doctorAssigned,
                "clinicID": 1,
                "contact": $scope.fields.patientContact,
                "name": $scope.fields.patientName,
                "gender": "Male",
                "channelID": "1",
                "time": $scope.fields.appointmentTime
            })
                .success(function (data) {
                    console.log("Successful with http post");
                    console.log(data);

                    var event = data;

                    switch ($scope.fields.appointmentType) {

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

        } else {
            console.log("Form is not valid. Please try again.");
        }

    };

    /* function to delete appointment */
    $scope.deleteAppointment = function () {

        var urlStr = '/Clearvision/_api/appointmentsCUD/' + $scope.fields.appointmentId;

        var req = {
            method: 'DELETE',
            url: urlStr,
            headers: {'Content-Type': 'application/json'},
            data: {
                "contact": $scope.fields.patientContact
            }
        };

        $http(req)
            .success(function (data) {
                console.log("Successfully deleted");
                console.log(data);
                var event = data;

                switch ($scope.fields.appointmentType) {

                    case "Screening":
                        var appointmentIndex = 0;
                        angular.forEach($scope.drHoScreenings.events, function (screeningAppointment) {
                            if (screeningAppointment.id === $scope.fields.appointmentId) {

                                $scope.drHoScreenings.events.splice(appointmentIndex, 1);

                            }
                            appointmentIndex++;
                        });
                        if (event != 'Object {}') {
                            $scope.drHoScreenings.events.push(event);
                        }
                        break;

                    case "Pre Evaluation":
                        var appointmentIndex = 0;
                        angular.forEach($scope.drHoPreEvaluations.events, function (preEvaluationAppointment) {
                            if (preEvaluationAppointment.id === $scope.fields.appointmentId) {
                                $scope.drHoPreEvaluations.events.splice(appointmentIndex, 1);

                            }
                            appointmentIndex++;
                        });
                        if (event != 'Object {}') {
                            $scope.drHoPreEvaluations.events.push(event);
                        }
                        break;

                    case "Surgery":
                        var appointmentIndex = 0;
                        angular.forEach($scope.drHoSurgeries.events, function (surgeryAppointment) {
                            if (surgeryAppointment.id === $scope.fields.appointmentId) {
                                $scope.drHoSurgeries.events.splice(appointmentIndex, 1);

                            }
                            appointmentIndex++;
                        });
                        if (event != 'Object {}') {
                            $scope.drHoSurgeries.events.push(event);
                            break;
                        }

                }
            })
    };

    /* function to update appointment */
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

    /* --- start of date picker codes --- */
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
    /* --- end of date picker codes --- */

    /* initialization when page first loads */
    $scope.fields = {};
    $scope.remarkWarning = "Please select a patient";
    $scope.addAndBlockButtons = true;
    $scope.screeningActive = true;
    $scope.preEvaluationActive = true;
    $scope.surgeryActive = true;

    /* different lists to populate form. will subsequently get from backend */
    $scope.listOfAppointmentTypes = ["Screening", "Pre Evaluation", "Surgery"];
    $scope.listOfAppointmentTimings = ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00"];
    $scope.listOfMarketingChannels = ["Email", "Friend", "Facebook Advertisement", "Clearvision Website"];

    /* function to populate patient details upon selection on the edit appointment form */
    $scope.populatePatientDetails = function () {
        var patientName = $scope.selectedPatient.name;

        angular.forEach($scope.fields.patientList, function (patient) {
            if (patientName === patient.name) {
                $scope.fields.patientName = patient.name;
                $scope.fields.patientContact = patient.contact;
            }
        })
    };

    /* function to clear fields in form */
    $scope.clearForm = function () {
        $scope.fields = {};
        $scope.appointmentForm.$setPristine();
        $scope.appointmentForm.$setUntouched();
    };

    /* function to show appointment form */
    $scope.showForm = function (formType) {
        $scope.leftAnimation = "col-sm-8 left-content-resize";
        $scope.rightAnimation = "col-sm-4 right-content-show";
        $scope.addAndBlockButtons = false;

        if (formType === 'Create') {
            // Perform these operations when showing the create appointment form
            $scope.showPatientList = false;
            $scope.showSubmitButton = true;
            $scope.showDeleteButton = false;
            $scope.showEditButton = false;
            $scope.showResetButton = true;
            $scope.formTitle = "Create New Appointment";

        } else if (formType === 'Edit') {
            // Perform these operations when showing the edit appointment form
            $scope.showPatientList = true;
            $scope.showSubmitButton = false;
            $scope.showDeleteButton = true;
            $scope.showEditButton = true;
            $scope.showResetButton = false;
            $scope.formTitle = "Edit New Appointment";
            $scope.disablePatientNameInput = true;
            $scope.disablePatientContactInput = true;
            $scope.disableAssignedDoctorInput = true;
            $scope.disableMktgChannelInput = true;

        } else {
            // Do nothing
        }
    };

    /* function to hide appointment form */
    $scope.hideForm = function () {
        $scope.leftAnimation = "col-sm-12 left-content"
        $scope.rightAnimation = "col-sm-4 right-content"

        $scope.clearForm();
        $scope.addAndBlockButtons = true;
        $scope.disablePatientNameInput = false;
        $scope.disablePatientContactInput = false;
        $scope.disableAssignedDoctorInput = false;
        $scope.disableMktgChannelInput = false;
    };

    /* function to enable iSchedule */
    $scope.enableISchedule = function () {
        $scope.getLowHeatMap();
        $scope.getMedHeatMap();
        $scope.getHighHeatMap();
        $scope.drHoScreenings.events.splice(0);
        $scope.drHoPreEvaluations.events.splice(0);
        $scope.drHoSurgeries.events.splice(0);
    };

    /* function to disable iSchedule */
    $scope.disableISchedule = function () {
        $scope.lowHeatMap.events.splice(0);
        $scope.medHeatMap.events.splice(0);
        $scope.highHeatMap.events.splice(0);
        $scope.getDrHoScreenings();
        $scope.getDrHoPreEvaluations();
        $scope.getDrHoSurgeries();
    };

    /* function to filter by appointment types */
    $scope.filterByAppointmentTypes = function (appointmentType, hidesTheRest) {
        switch (appointmentType) {
            case "Screening" :
                if (hidesTheRest) {
                    if (!$scope.screeningActive) {
                        $scope.drHoScreenings.events.splice(0);
                        $scope.getDrHoScreenings();
                    }
                    $scope.drHoPreEvaluations.events.splice(0);
                    $scope.drHoSurgeries.events.splice(0);
                    $scope.screeningActive = true;
                    $scope.preEvaluationActive = false;
                    $scope.surgeryActive = false;

                } else {
                    if ($scope.screeningActive) {
                        $scope.screeningActive = false;
                        $scope.drHoScreenings.events.splice(0);
                    } else {
                        $scope.screeningActive = true;
                        $scope.getDrHoScreenings();
                    }
                }
                break;

            case "Pre Evaluation":
                if (hidesTheRest) {
                    if (!$scope.preEvaluationActive) {
                        $scope.drHoPreEvaluations.events.splice(0);
                        $scope.getDrHoPreEvaluations();
                    }
                    $scope.drHoScreenings.events.splice(0);
                    $scope.drHoSurgeries.events.splice(0);
                    $scope.screeningActive = false;
                    $scope.preEvaluationActive = true;
                    $scope.surgeryActive = false;

                } else {
                    if ($scope.preEvaluationActive) {
                        $scope.preEvaluationActive = false;
                        $scope.drHoPreEvaluations.events.splice(0);
                    } else {
                        $scope.preEvaluationActive = true;
                        $scope.getDrHoPreEvaluations();
                    }
                }
                break;

            case "Surgery":
                if (hidesTheRest) {
                    if (!$scope.surgeryActive) {
                        $scope.drHoSurgeries.events.splice(0);
                        $scope.getDrHoSurgeries();
                    }
                    $scope.drHoScreenings.events.splice(0);
                    $scope.drHoPreEvaluations.events.splice(0);
                    $scope.screeningActive = false;
                    $scope.preEvaluationActive = false;
                    $scope.surgeryActive = true;

                } else {
                    if ($scope.surgeryActive) {
                        $scope.surgeryActive = false;
                        $scope.drHoSurgeries.events.splice(0);
                    } else {
                        $scope.surgeryActive = true;
                        $scope.getDrHoSurgeries();
                    }
                }
                break;
        }
    };

    /* iSchedule list */
    $scope.showTimeList = function (date) {
        date.active = !date.active;
    };

    $scope.dates = [
        {
            apptDate: 'Wed 18 Aug 2015',
            apptTimeslots: [
                {apptTime: "9am"},
                {apptTime: "1pm"},
                {apptTime: "2pm"}
            ]
        },
        {
            apptDate: 'Fri 21 Aug 2015',
            apptTimeslots: [
                {apptTime: "11am"},
                {apptTime: "2pm"},
                {apptTime: "5pm"}
            ]
        },
    ];

    $scope.showLeastPackedSlots = function (date) {
        date.active = !date.active;
    };

    $scope.leastPackSlots = [
        {
            apptDate: 'Wed 18 Aug 2015',
            apptTimeslots: [
                {apptTime: "9am"},
                {apptTime: "1pm"},
                {apptTime: "2pm"}
            ]
        },
        {
            apptDate: 'Fri 21 Aug 2015',
            apptTimeslots: [
                {apptTime: "11am"},
                {apptTime: "2pm"},
                {apptTime: "5pm"}
            ]
        }
    ];

});

/* directive for single click */
appCalendar.directive('sglclick', ['$parse', function ($parse) {
    return {
        restrict: 'A',
        link: function (scope, element, attr) {
            var fn = $parse(attr['sglclick']);
            var delay = 300, clicks = 0, timer = null;
            element.on('click', function (event) {
                clicks++;  //count clicks
                if (clicks === 1) {
                    timer = setTimeout(function () {
                        scope.$apply(function () {
                            fn(scope, {$event: event});
                        });
                        clicks = 0; //after action performed, reset counter
                    }, delay);
                } else {
                    clearTimeout(timer); //prevent single-click action
                    clicks = 0; //after action performed, reset counter
                }
            });
        }
    };
}]);