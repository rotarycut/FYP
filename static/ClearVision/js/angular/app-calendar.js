var appCalendar = angular.module('app.calendar', ['ngProgress']);


appCalendar.controller('CalendarCtrl', function ($scope, $compile, uiCalendarConfig, $timeout, $http, searchContact, appointmentService, ngProgressFactory, $modal, postAppointmentSvc, clearFormSvc, disableIScheduleSvc, deleteAppointmentSvc, updateAppointmentSvc, hideFormSvc, eventClickSvc) {

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
        color: '#f98a5f',
        textColor: 'White',
        events: []
    };

    $scope.drHoPreEvaluations = {
        color: '#aa2159',
        textColor: 'White',
        events: []
    };

    $scope.drHoSurgeries = {
        color: '#74aaf7',
        textColor: 'White',
        events: []
    };

    $scope.drGohScreenings = {
        color: '#f98a5f',
        textColor: 'White',
        events: []
    };

    $scope.drGohPreEvaluations = {
        color: '#aa2159',
        textColor: 'White',
        events: []
    };

    $scope.drGohSurgeries = {
        color: '#74aaf7',
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

    /* function to get iSchedule */
    $scope.getISchedule = function () {

        $scope.appointments = [];
        var url = '/Clearvision/_api/iSchedule/?limit=5&daysAhead=7&timeslotType=' + $scope.fields.appointmentType + '&upperB=5&docName=Dr%20Ho'

        $http.get(url)
            .success(function (listOfAppointments) {
                angular.forEach(listOfAppointments, function (appointment) {
                    $scope.appointments.push(appointment);
                });
            })
    };

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

    /* function to get heat map */
    $scope.getHeatMap = function (appointmentType, doctorName) {

        var lowHeatUrl = '/Clearvision/_api/HeatMap/?monthsAhead=1&timeslotType=' + appointmentType + '&upperB=1&lowerB=0&docName=' + doctorName;
        var medHeatUrl = '/Clearvision/_api/HeatMap/?monthsAhead=1&timeslotType=' + appointmentType + '&upperB=3&lowerB=2&docName=' + doctorName;
        var highHeatUrl = '/Clearvision/_api/HeatMap/?monthsAhead=1&timeslotType=' + appointmentType + '&upperB=10&lowerB=4&docName=' + doctorName;

        $http.get(lowHeatUrl)
            .success(function (listOfAppointments) {
                var count = 0;
                angular.forEach(listOfAppointments, function (appointment) {
                    //appointment.title = appointment.patientcount + " patient(s)";
                    if (count <= 30) {
                        $scope.lowHeatMap.events.push(appointment);
                        count++;
                    } else {
                        return;
                    }
                })
            })
        $http.get(medHeatUrl)
            .success(function (listOfAppointments) {
                var count = 0;
                angular.forEach(listOfAppointments, function (appointment) {
                    //appointment.title = appointment.patientcount + " patient(s)";
                    if (count <= 20) {
                        $scope.medHeatMap.events.push(appointment);
                        count++;
                    } else {
                        return;
                    }
                })
            })
        $http.get(highHeatUrl)
            .success(function (listOfAppointments) {
                var count = 0;
                angular.forEach(listOfAppointments, function (appointment) {
                    //appointment.title = appointment.patientcount + " patient(s)";
                    if (count <= 20) {
                        $scope.highHeatMap.events.push(appointment);
                        count++;
                    } else {
                        return;
                    }
                })
            })
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
        eventClickSvc.eventClick(appointment);
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

        var strOfPatientNames = "";
        //var haveToolTip = null;

        try {
            //console.log("IN");
            var tooltip = event.tooltip;

            //haveToolTip = true;

        } catch (Exception) {
            //haveToolTip = false;
            return;
        }

        //console.log(haveToolTip);
        try {
            var listOfPatients = event.patients;

            listOfPatients.forEach(function (patient) {
                strOfPatientNames += patient.name;
                strOfPatientNames += '\r\n';
            });

        } catch (Exception) {
            //console.log("Exception");
            strOfPatientNames = event.tooltip;
            //console.log(strOfPatientNames);
            return strOfPatientNames;
        }

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
            eventStartEditable: false,
            eventDurationEditable: false,
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

    /* function to retrieve doctor's appointments */

    /* function to retrieve dr ho's screening appointments */
    $scope.getDrHoScreenings = function () {
        appointmentService.getDrHoScreenings()
            .then(function (appointments) {
                angular.forEach(appointments, function (appt) {
                    $scope.drHoScreenings.events.push(appt);
                });
            },
            function (data) {
                console.log("Failed to retrieve appointments");
            });
    };

    /* function to retrieve dr ho's pre-evaluation appointments */
    $scope.getDrHoPreEvaluations = function () {
        appointmentService.getDrHoPreEvaluations()
            .then(function (appointments) {
                angular.forEach(appointments, function (appt) {
                    $scope.drHoPreEvaluations.events.push(appt);
                });
            },
            function (data) {
                console.log("Failed to retrieve appointments");
            });
    };

    /* function to retrieve dr ho's surgery appointments */
    $scope.getDrHoSurgeries = function () {
        appointmentService.getDrHoSurgeries()
            .then(function (appointments) {
                angular.forEach(appointments, function (appt) {
                    $scope.drHoSurgeries.events.push(appt);
                });
            },
            function (data) {
                console.log("Failed to retrieve appointments");
            });
    };

    /* function to retrieve dr goh's screening appointments */
    $scope.getDrGohScreenings = function () {
        appointmentService.getDrGohScreenings()
            .then(function (appointments) {
                angular.forEach(appointments, function (appt) {
                    $scope.drGohScreenings.events.push(appt);
                });
            },
            function (data) {
                console.log("Failed to retrieve appointments");
            });
    };

    /* function to retrieve dr goh's pre-evaluation appointments */
    $scope.getDrGohPreEvaluations = function () {
        appointmentService.getDrGohPreEvaluations()
            .then(function (appointments) {
                angular.forEach(appointments, function (appt) {
                    $scope.drGohPreEvaluations.events.push(appt);
                });
            },
            function (data) {
                console.log("Failed to retrieve appointments");
            });
    };

    /* function to retrieve dr goh's surgery appointments */
    $scope.getDrGohSurgeries = function () {
        appointmentService.getDrGohSurgeries()
            .then(function (appointments) {
                angular.forEach(appointments, function (appt) {
                    $scope.drGohSurgeries.events.push(appt);
                });
            },
            function (data) {
                console.log("Failed to retrieve appointments");
            });
    };

    /* function to splice appointments */
    $scope.spliceAppointment = function (appointmentsInType, retrievedAppointmentId) {
        console.log(appointmentsInType);
        var appointmentIndex = 0;
        angular.forEach(appointmentsInType, function (existingAppointment) {
            if (existingAppointment.id === retrievedAppointmentId) {
                appointmentsInType.splice(appointmentIndex, 1);
            }
            appointmentIndex++;
        });
    };

    /* --- start of date picker codes --- */
    $scope.datepickers = {
        showDatePicker: false,
        showDatePicker2: false
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
    $scope.screeningActive = true;
    $scope.preEvaluationActive = true;
    $scope.surgeryActive = true;
    $scope.showFilters = true;
    $scope.progressbar = ngProgressFactory.createInstance();
    $scope.legendScreenClicked = "legend-screen-clicked";
    $scope.legendEvalClicked = "legend-preEval-clicked";
    $scope.legendSurgeryClicked = "legend-surgery-clicked";
    $scope.legendAllClicked = "legend-all-clicked";

    $scope.form = {
        showForm: false,
        showFields: {
            appointmentType: true,
            contact: true,
            name: true,
            datepicker: true,
            time: true,
            doctor: true,
            marketingChannel: true,
            remarks: true,
            earliestAvl: true,
            waitingList: true
        },
        disableFields: {
            patientName: false,
            contact: false,
            doctor: false,
            marketingChannel: false
        },
        showButtons: {
            createForm: false,
            editForm: false,
            addAndBlock: true
        }
    };

    /* different lists to populate form. will subsequently get from backend */
    $scope.listOfAppointmentTypes = ["Screening", "Pre Evaluation", "Surgery"];
    //$scope.listOfAppointmentTimings = ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00"];
    $scope.listOfMarketingChannels = ["987 Radio", "Andrea Chong Blog", "Channel News Asia", "Referred by Doctor", "ST Ads", "Others"];
    $scope.listOfDoctors = ["Dr Ho", "Dr Goh"];
    $scope.selectedCalendar = "myCalendar1";

    $scope.changeCalendar = function (selectedCalendar) {
        $scope.selectedCalendar = selectedCalendar;
    };

    /* function to retrieve list of appointment timings */
    $scope.getAppointmentTimings = function (apptType, apptTime) {

        $http.get('/Clearvision/_api/ViewApptTimeslots/?apptType=' + apptType + '&docName=Dr%20Ho')
            .success(function (listOfTimings) {
                console.log(listOfTimings);
                $scope.listOfAppointmentTimings = listOfTimings;
                $scope.fields.appointmentTime = apptTime;
                console.log(apptTime);
            });
    };

    /* function to populate patient details upon selection on the edit appointment form */
    $scope.populatePatientDetails = function () {
        console.log($scope.fields.selectedPatient.name);
        var patientName = $scope.fields.selectedPatient.name;

        angular.forEach($scope.fields.patientList, function (patient) {
            if (patientName === patient.name) {
                $scope.fields.patientName = patient.name;
                $scope.fields.patientContact = patient.contact;
                $scope.fields.marketingChannel = patient.marketingname;
            }
        })

        var url = '/Clearvision/_api/Remarks/?patient=' + $scope.fields.patientContact + '&appt=' + $scope.fields.appointmentId;

        $http.get(url)
            .success(function (patientAppointment) {
                $scope.fields.appointmentRemarks = patientAppointment.remarks;
                $scope.fields.originalAppointmentRemarks = patientAppointment.remarks;
            })

            .error(function () {
                console.log("Error getting patient's appointment remarks.");
            });

        for (var field in $scope.form.showFields) {
            $scope.form.showFields[field] = true;
        }

        $scope.form.showButtons['editForm'] = true;

        $scope.enableISchedule();
    };

    /* function to navigate to date after selection on date picker */
    $scope.navigateToDate = function () {
        var selectedDate = $scope.getFormattedDate($scope.fields.appointmentDate);
        $('#drHoCalendar').fullCalendar('gotoDate', selectedDate);
        $scope.fields.appointmentDate = selectedDate;
    };

    /* function to format waiting list date */
    $scope.formatWaitingListDate = function () {
        $scope.fields.waitingDate = $scope.getFormattedDate($scope.fields.waitingDate);
    };

    /* function to format date */
    $scope.getFormattedDate = function (fullDate) {
        var year = fullDate.getFullYear();

        var month = fullDate.getMonth() + 1;
        if (month <= 9) {
            month = '0' + month;
        }

        var day = fullDate.getDate();
        if (day <= 9) {
            day = '0' + day;
        }

        var formattedDate = year + '-' + month + '-' + day;
        return formattedDate;
    };

    /* function to show appointment form */
    $scope.showForm = function (formType) {
        $scope.scaleDownCalendar = true;
        $scope.progressbar.start();
        $scope.progressbar.complete();
        $timeout(function () {
            $scope.form.showForm = true;
        }, 800);

        if (formType === 'Create') {
            // Perform these operations when showing the create appointment form
            $scope.formTitle = "Create New Appointment";
            $scope.showPatientList = false;
            $scope.form.showButtons['createForm'] = true;
            $scope.form.showButtons['addAndBlock'] = false;

        } else if (formType === 'Edit') {
            // Perform these operations when showing the edit appointment form
            $scope.showPatientList = true;
            $scope.formTitle = "Edit Appointment";

            for (var field in $scope.form.showFields) {
                $scope.form.showFields[field] = false;
            }
            for (var field in $scope.form.disableFields) {
                $scope.form.disableFields[field] = true;
            }
            for (var field in $scope.form.showButtons) {
                $scope.form.showButtons[field] = false;
            }

        } else if (formType == 'EditOnePatient') {

            // Perform these operations when editing an appointment with only 1 patient
            $scope.showPatientList = true;
            $scope.formTitle = "Edit Appointment";

            for (var field in $scope.form.showFields) {
                $scope.form.showFields[field] = true;
            }
            for (var field in $scope.form.disableFields) {
                $scope.form.disableFields[field] = true;
            }
            for (var field in $scope.form.showButtons) {
                $scope.form.showButtons[field] = false;
            }
            $scope.form.showButtons['editForm'] = true;

        } else {
            // Do nothing
        }
    };

    /* function to hide appointment form */
    $scope.hideForm = function () {
        hideFormSvc.hideForm();
    };

    /* function to clear form */
    $scope.clearForm = function () {
        clearFormSvc.clearForm();
        disableIScheduleSvc.disableISchedule();
    };

    /* function to enable iSchedule */
    $scope.enableISchedule = function () {

        // do not enable iSchedule until both appointment type and doctor are selected
        if ($scope.fields.appointmentType == undefined || $scope.fields.doctorAssigned == undefined) {
            return;
        }
        
        $scope.changeView('month', 'myCalendar1');

        console.log($scope.selectedCalendar);
        console.log($scope.fields.appointmentType);

        if ($scope.formTitle === 'Create New Appointment' || $scope.iSchedule === true) {
            $scope.getAppointmentTimings($scope.fields.appointmentType);
        }

        if ($scope.formTitle === 'Create New Appointment' || $scope.formTitle === 'Edit Appointment') {
            if (!$scope.iSchedule) {
                $scope.showHeatMap = true;
                $scope.iSchedule = true;
                $scope.drHoScreenings.events.splice(0);
                $scope.drHoPreEvaluations.events.splice(0);
                $scope.drHoSurgeries.events.splice(0);
                $scope.getHeatMap($scope.fields.appointmentType, $scope.fields.doctorAssigned);
                $scope.getISchedule();
                $scope.showFilters = false;
            } else {
                $scope.lowHeatMap.events.splice(0);
                $scope.medHeatMap.events.splice(0);
                $scope.highHeatMap.events.splice(0);
                $scope.getHeatMap($scope.fields.appointmentType, $scope.fields.doctorAssigned);
            }
        }
    };

    /* function to search for contact */
    $scope.searchContact = function () {
        searchContact.search($scope.fields.patientContact).then(function (response) {
            if (response.data.length !== 0) {
                $scope.fields.patientName = response.data[0].name;
            } else {
                $scope.fields.patientName = "";
            }
        });
    };

    /* function to filter by appointment types */
    $scope.filterByAppointmentTypes = function (appointmentType, hidesTheRest) {
        switch (appointmentType) {
            case "Screening" :
                if (hidesTheRest) {
                    if (!$scope.screeningActive) {
                        $scope.legendScreenClicked = "legend-screen";
                        $scope.legendAllClicked = "legend-all";
                        $scope.drHoScreenings.events.splice(0);
                        $scope.getDrHoScreenings();
                    }
                    $scope.legendScreenClicked = "legend-screen-clicked";
                    $scope.legendEvalClicked = "legend-preEval";
                    $scope.legendSurgeryClicked = "legend-surgery";
                    $scope.legendAllClicked = "legend-all";
                    $scope.drHoPreEvaluations.events.splice(0);
                    $scope.drHoSurgeries.events.splice(0);
                    $scope.screeningActive = true;
                    $scope.preEvaluationActive = false;
                    $scope.surgeryActive = false;

                } else {
                    if ($scope.screeningActive) {
                        $scope.legendScreenClicked = "legend-screen";
                        $scope.legendAllClicked = "legend-all";
                        $scope.screeningActive = false;
                        $scope.drHoScreenings.events.splice(0);
                    } else {
                        $scope.legendScreenClicked = "legend-screen-clicked";
                        $scope.screeningActive = true;
                        $scope.getDrHoScreenings();
                        if ($scope.preEvaluationActive && $scope.surgeryActive) {
                            $scope.legendAllClicked = "legend-all-clicked";
                        }
                    }
                }
                break;

            case "Pre Evaluation":
                if (hidesTheRest) {
                    if (!$scope.preEvaluationActive) {
                        $scope.legendEvalClicked = "legend-preEval";
                        $scope.legendAllClicked = "legend-all";
                        $scope.drHoPreEvaluations.events.splice(0);
                        $scope.getDrHoPreEvaluations();
                    }
                    $scope.legendEvalClicked = "legend-preEval-clicked";
                    $scope.legendScreenClicked = "legend-screen";
                    $scope.legendSurgeryClicked = "legend-surgery";
                    $scope.legendAllClicked = "legend-all";
                    $scope.drHoScreenings.events.splice(0);
                    $scope.drHoSurgeries.events.splice(0);
                    $scope.screeningActive = false;
                    $scope.preEvaluationActive = true;
                    $scope.surgeryActive = false;

                } else {
                    if ($scope.preEvaluationActive) {
                        $scope.legendEvalClicked = "legend-preEval";
                        $scope.legendAllClicked = "legend-all";
                        $scope.preEvaluationActive = false;
                        $scope.drHoPreEvaluations.events.splice(0);
                    } else {
                        $scope.legendEvalClicked = "legend-preEval-clicked";
                        $scope.preEvaluationActive = true;
                        $scope.getDrHoPreEvaluations();
                        if ($scope.screeningActive && $scope.surgeryActive) {
                            $scope.legendAllClicked = "legend-all-clicked";
                        }
                    }
                }
                break;

            case "Surgery":
                if (hidesTheRest) {
                    if (!$scope.surgeryActive) {
                        $scope.legendSurgeryClicked = "legend-surgery";
                        $scope.legendAllClicked = "legend-all";
                        $scope.drHoSurgeries.events.splice(0);
                        $scope.getDrHoSurgeries();
                    }
                    $scope.legendSurgeryClicked = "legend-surgery-clicked";
                    $scope.legendEvalClicked = "legend-preEval";
                    $scope.legendScreenClicked = "legend-screen";
                    $scope.legendAllClicked = "legend-all";
                    $scope.drHoScreenings.events.splice(0);
                    $scope.drHoPreEvaluations.events.splice(0);
                    $scope.screeningActive = false;
                    $scope.preEvaluationActive = false;
                    $scope.surgeryActive = true;

                } else {
                    if ($scope.surgeryActive) {
                        $scope.legendSurgeryClicked = "legend-surgery";
                        $scope.legendAllClicked = "legend-all";
                        $scope.surgeryActive = false;
                        $scope.drHoSurgeries.events.splice(0);
                    } else {
                        $scope.legendSurgeryClicked = "legend-surgery-clicked";
                        $scope.surgeryActive = true;
                        $scope.getDrHoSurgeries();
                        if ($scope.screeningActive && $scope.preEvaluationActive) {
                            $scope.legendAllClicked = "legend-all-clicked";
                        }
                    }
                }
                break;

            case "All" :
                if (hidesTheRest) {
                    //console.log("SHOW ALL");
                    if (!$scope.screeningActive) {
                        $scope.legendScreenClicked = "legend-screen-clicked";
                        $scope.legendAllClicked = "legend-all-clicked";
                        $scope.screeningActive = true;
                        $scope.getDrHoScreenings();
                    }
                    if (!$scope.preEvaluationActive) {
                        $scope.legendEvalClicked = "legend-preEval-clicked";
                        $scope.legendAllClicked = "legend-all-clicked";
                        $scope.preEvaluationActive = true;
                        $scope.getDrHoPreEvaluations();
                    }
                    if (!$scope.surgeryActive) {
                        $scope.legendSurgeryClicked = "legend-surgery-clicked";
                        $scope.legendAllClicked = "legend-all-clicked";
                        $scope.surgeryActive = true;
                        $scope.getDrHoSurgeries();
                    }

                } else {
                    //console.log("HIDES ALL");
                    $scope.legendScreenClicked = "legend-screen";
                    $scope.legendEvalClicked = "legend-preEval";
                    $scope.legendSurgeryClicked = "legend-surgery";
                    $scope.legendAllClicked = "legend-all";
                    $scope.drHoScreenings.events.splice(0);
                    $scope.drHoPreEvaluations.events.splice(0);
                    $scope.drHoSurgeries.events.splice(0);
                    $scope.screeningActive = false;
                    $scope.preEvaluationActive = false;
                    $scope.surgeryActive = false;
                }
                break;
        }
    };

    /* function to show waiting fields */
    $scope.showWaitingFields = function (showFields) {
        if (showFields === 'yes') {
            $scope.showWaitingDate = true;
            $scope.showWaitingTime = true;
        } else {
            $scope.showWaitingDate = false;
            $scope.showWaitingTime = false;
            console.log("HERE");
        }
    };

    /* iSchedule list */
    $scope.showTimeList = function (date) {
        date.active = !date.active;
    };

    /*$scope.dates = [
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
     ];*/

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

    /* --- start of create form submit button modal codes --- */
    $scope.animationsEnabled = true;

    $scope.openCreateModal = function (size) {

        var modalInstance = $modal.open({
            animation: $scope.animationsEnabled,
            templateUrl: 'myCreateModalContent.html',
            controller: 'ModalInstanceCtrl',
            size: size,
            resolve: {
                patientInfo: function () {
                    //$scope.fields.appointmentDate = $scope.getFormattedDate($scope.fields.appointmentDate);

                    if ($scope.fields.waitingList === "True") {
                        $scope.fields.hasWaitList = true;
                    } else {
                        $scope.fields.hasWaitList = false;
                    }

                    return $scope.fields;
                }
            }
        });
    };
    /* --- end of modal codes --- */

    /* --- start of edit form delete button modal codes --- */
    $scope.openDeleteModal = function (size) {

        var modalInstance = $modal.open({
            animation: $scope.animationsEnabled,
            templateUrl: 'myDeleteModalContent.html',
            controller: 'ModalInstanceCtrl',
            size: size,
            resolve: {
                patientInfo: function () {
                    return $scope.fields;
                }
            }
        });
    };
    /* --- end of modal codes --- */

    /* --- start of edit form update button modal codes --- */
    $scope.openUpdateModal = function (size) {

        var modalInstance = $modal.open({
            animation: $scope.animationsEnabled,
            templateUrl: 'myUpdateModalContent.html',
            controller: 'ModalInstanceCtrl',
            size: size,
            resolve: {
                patientInfo: function () {

                    if ($scope.fields.originalAppointmentDate !== $scope.fields.appointmentDate) {
                        $scope.fields.dateIsChanged = true;
                    } else {
                        $scope.fields.dateIsChanged = false;
                    }
                    if ($scope.fields.originalAppointmentTime !== $scope.fields.appointmentTime) {
                        $scope.fields.timeIsChanged = true;
                    } else {
                        $scope.fields.timeIsChanged = false;
                    }
                    if ($scope.fields.originalAppointmentType !== $scope.fields.appointmentType) {
                        $scope.fields.typeIsChanged = true;
                    } else {
                        $scope.fields.typeIsChanged = false;
                    }
                    if ($scope.fields.originalAppointmentRemarks !== $scope.fields.appointmentRemarks) {
                        $scope.fields.remarksIsChanged = true;
                    } else {
                        $scope.fields.remarksIsChanged = false;
                    }

                    return $scope.fields;
                }
            }
        });
    };
    /* --- end of modal codes --- */

    /* function to validate create appointment */
    $scope.isFormValid = function (isValid) {
        if (isValid) {
            $scope.openCreateModal('lg');
        } else {
            console.log("Invalid form");
            // do nothing
        }
    };

    /* function to validate create appointment */
    $scope.isEditFormValid = function (isValid) {
        if (isValid) {
            $scope.openUpdateModal('lg');
        } else {
            console.log("Invalid form");
            // do nothing
        }
    };

    /* pass the scope to the post appointment service upon initialization */
    postAppointmentSvc.getScope($scope);
    clearFormSvc.getScope($scope);
    disableIScheduleSvc.getScope($scope);
    deleteAppointmentSvc.getScope($scope);
    updateAppointmentSvc.getScope($scope);
    hideFormSvc.getScope($scope);
    eventClickSvc.getScope($scope);

    /* function to search for patient appointments in search box */
    $scope.searchForAppt = function (searchValue) {
        return $http.get('/Clearvision/_api/SearchBar/?search=' + searchValue + '&limit=15')
            .then(function (response) {
                var row = response.data;
                var rowArr = [];
                angular.forEach(row, function (appt) {
                    var rowStr = appt.apptDate + ", " + appt.apptStart + " (" + appt.name + ": " + appt.contact + ")";
                    rowArr.push(rowStr)
                });
                return rowArr;
            });
    };

    /* function after selecting an appointment from the search box result */
    $scope.onSelect = function ($item, $model, $label) {
        var commarIndex = $item.indexOf(",");
        var date = $item.substring(0, commarIndex);
        $scope.changeView('agendaDay', 'myCalendar1');
        $('#drHoCalendar').fullCalendar('gotoDate', date);
        $scope.searchText = "";
    };

});

/* controller for modal instance */
appCalendar.controller('ModalInstanceCtrl', function ($scope, $modalInstance, patientInfo, postAppointmentSvc, clearFormSvc, disableIScheduleSvc, deleteAppointmentSvc, updateAppointmentSvc) {
    $scope.patientDetails = patientInfo;

    $scope.createAppointment = function () {
        postAppointmentSvc.postAppointment();
        //disableIScheduleSvc.disableISchedule();
        $modalInstance.close();
        clearFormSvc.clearForm();
    };

    $scope.deleteAppointment = function () {
        deleteAppointmentSvc.deleteAppointment();
        $modalInstance.close();
    };

    $scope.updateAppointment = function () {
        updateAppointmentSvc.updateAppointment();
        $modalInstance.close();
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
});

/* service to search for patient's details based on contact */
appCalendar.service('searchContact', ['$http', function ($http) {
    return {
        search: function (contact) {
            var url = '/Clearvision/_api/patients/?search=' + contact;
            return $http.get(url);
        }
    }
}]);