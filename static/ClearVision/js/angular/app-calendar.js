var appCalendar = angular.module('app.calendar', ['ngProgress']);


appCalendar.controller('CalendarCtrl', function ($scope, $compile, uiCalendarConfig, $timeout, $http, searchContact, appointmentService, ngProgressFactory) {

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

    /* function to get heat map */
    $scope.getHeatMap = function (appointmentType, doctorId) {

        var url = 'http://demo4552602.mockable.io/heatmap';

        // /Clearvision/_api/HeatMap/?monthsAhead=6&timeslotType=Screening&doctorId=1&patientLower=0&patientUpper=2
        // lowHeatMap.events.push(appointment)

        // /Clearvision/_api/HeatMap/?monthsAhead=6&timeslotType=Screening&doctorId=1&patientLower=2&patientUpper=4
        // medHeatMap.events.push(appointment)

        // /Clearvision/_api/HeatMap/?monthsAhead=6&timeslotType=Screening&doctorId=1&patientLower=4&patientUpper=infinity
        // highHeatMap.events.push(appointment)

        $http.get(url)
            .success(function (listOfAppointments) {
                angular.forEach(listOfAppointments, function (appointment) {
                    appointment.title = appointment.patientcount + " patient(s)";
                    $scope.lowHeatMap.events.push(appointment);
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
        $scope.clearForm();
        $scope.alertMessage = (appointment.title + ' was clicked ');
        $scope.fields.appointmentId = appointment.id;
        $scope.fields.patientList = appointment.patients;
        $scope.fields.appointmentType = appointment.apptType;
        $scope.fields.appointmentDate = appointment.date;
        $scope.fields.doctorAssigned = appointment.doctor;
        $scope.fields.originalAppointmentType = appointment.apptType;

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

        var strOfPatientNames = "";

        try {
            var listOfPatients = event.patients;

            listOfPatients.forEach(function (patient) {
                strOfPatientNames += patient.name;
                strOfPatientNames += '\r\n';
            });

        } catch (Exception) {
            return;
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

    /* function to create appointment */
    $scope.postAppointment = function (formIsValid) {

        if (formIsValid) {

            var formattedDate = $scope.getFormattedDate($scope.fields.appointmentDate);

            if ($scope.fields.appointmentRemarks === undefined) {
                $scope.fields.appointmentRemarks = "";
            }

            $http.post('/Clearvision/_api/appointmentsCUD/', {
                "type": $scope.fields.appointmentType,
                "date": formattedDate,
                "docID": $scope.fields.doctorAssigned,
                "clinicID": 1,
                "contact": $scope.fields.patientContact,
                "name": $scope.fields.patientName,
                "gender": "Male",
                "channelID": "1",
                "time": $scope.fields.appointmentTime,
                "remarks": $scope.fields.appointmentRemarks
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
                var appointmentsLeftAfterDelete = Object.keys(event).length;

                switch ($scope.fields.appointmentType) {

                    case "Screening":
                        var appointmentIndex = 0;
                        angular.forEach($scope.drHoScreenings.events, function (screeningAppointment) {
                            if (screeningAppointment.id === $scope.fields.appointmentId) {

                                $scope.drHoScreenings.events.splice(appointmentIndex, 1);

                            }
                            appointmentIndex++;
                        });
                        if (appointmentsLeftAfterDelete != 0) {
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
                        if (appointmentsLeftAfterDelete != 0) {
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
                        if (appointmentsLeftAfterDelete != 0) {
                            $scope.drHoSurgeries.events.push(event);
                            break;
                        }

                }
            })
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

    /* function to update appointment */
    $scope.updateAppointment = function (isFormValid) {

        if (isFormValid) {
            var formattedDate = $scope.getFormattedDate($scope.fields.appointmentDate);

            if ($scope.fields.appointmentRemarks === undefined) {
                $scope.fields.appointmentRemarks = "";
            }

            var updateJson = {
                "contact": $scope.fields.patientContact,
                "replacementApptDate": formattedDate,
                "replacementApptTime": $scope.fields.appointmentTime,
                "type": $scope.fields.appointmentType,
                "docID": $scope.fields.doctorAssigned,
                "clinicID": 1,
                "remarks": $scope.fields.appointmentRemarks
            };

            console.log(updateJson);

            var urlStr = '/Clearvision/_api/appointmentsCUD/' + $scope.fields.appointmentId;
            console.log(urlStr);
            var req = {
                method: 'PATCH',
                url: urlStr,
                headers: {'Content-Type': 'application/json'},
                data: updateJson
            };

            $http(req)
                .success(function (data) {
                    console.log("Successfully updated");
                    console.log(data);

                    var event = data;

                    switch ($scope.fields.appointmentType) {

                        case "Screening":
                            $scope.spliceAppointment($scope.drHoScreenings.events, event.id);
                            $scope.drHoScreenings.events.push(event);
                            break;

                        case "Pre Evaluation":
                            $scope.spliceAppointment($scope.drHoPreEvaluations.events, event.id);
                            $scope.drHoPreEvaluations.events.push(event);
                            break;

                        case "Surgery":
                            $scope.spliceAppointment($scope.drHoSurgeries.events, event.id);
                            $scope.drHoSurgeries.events.push(event);
                            break;
                    }

                    // handle the update of the old appointment
                    if ($scope.fields.originalAppointmentType !== $scope.fields.appointmentType) {
                        console.log("Update old different appointment type");
                        var id = $scope.fields.appointmentId;

                        switch ($scope.fields.originalAppointmentType) {

                            case "Screening":
                                $scope.spliceAppointment($scope.drHoScreenings.events, id);

                                $http.get('/Clearvision/_api/appointments/' + id)
                                    .success(function (oldAppointment) {
                                        $scope.drHoScreenings.events.push(oldAppointment);
                                    });
                                break;

                            case "Pre Evaluation":
                                $scope.spliceAppointment($scope.drHoPreEvaluations.events, id);

                                $http.get('/Clearvision/_api/appointments/' + id)
                                    .success(function (oldAppointment) {
                                        $scope.drHoPreEvaluations.events.push(oldAppointment);
                                    });
                                break;

                            case "Surgery":
                                $scope.spliceAppointment($scope.drHoSurgeries.events, id);

                                $http.get('/Clearvision/_api/appointments/' + id)
                                    .success(function (oldAppointment) {
                                        $scope.drHoSurgeries.events.push(oldAppointment)
                                    });
                                break;
                        }
                    } else {
                        console.log("Update old same appointment type");
                        var id = $scope.fields.appointmentId;

                        switch ($scope.fields.appointmentType) {

                            case "Screening":
                                $scope.spliceAppointment($scope.drHoScreenings.events, id);

                                $http.get('/Clearvision/_api/appointments/' + id)
                                    .success(function (oldAppointment) {
                                        $scope.drHoScreenings.events.push(oldAppointment);
                                    });
                                break;

                            case "Pre Evaluation":
                                $scope.spliceAppointment($scope.drHoPreEvaluations.events, id);

                                $http.get('/Clearvision/_api/appointments/' + id)
                                    .success(function (oldAppointment) {
                                        $scope.drHoPreEvaluations.events.push(oldAppointment);
                                    });
                                break;

                            case "Surgery":
                                $scope.spliceAppointment($scope.drHoSurgeries.events, id);

                                $http.get('/Clearvision/_api/appointments/' + id)
                                    .success(function (oldAppointment) {
                                        $scope.drHoSurgeries.events.push(oldAppointment)
                                    });
                                break;
                        }
                    }
                })

                .error(function (data) {
                    console.log("Error with updating appointment");
                });

        } else {
            console.log("Form is not valid! Please try again.");
        }
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
    $scope.showAppointmentForm = false;
    $scope.progressbar = ngProgressFactory.createInstance();

    $scope.form = {
        appointmentType: true,
        contact: true,
        name: true,
        datepicker: true,
        time: true,
        doctor: true,
        marketingChannel: true,
        remarks: true,
        createButtons: true,
        editButtons: true
    };

    /* different lists to populate form. will subsequently get from backend */
    $scope.listOfAppointmentTypes = ["Screening", "Pre Evaluation", "Surgery"];
    $scope.listOfAppointmentTimings = ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00"];
    $scope.listOfMarketingChannels = ["Email", "Friend", "Facebook Advertisement", "Clearvision Website"];

    /* function to populate patient details upon selection on the edit appointment form */
    $scope.populatePatientDetails = function () {
        var patientName = $scope.fields.selectedPatient.name;

        angular.forEach($scope.fields.patientList, function (patient) {
            if (patientName === patient.name) {
                $scope.fields.patientName = patient.name;
                $scope.fields.patientContact = patient.contact;
            }
        })

        var url = '/Clearvision/_api/Remarks/?patient=' + $scope.fields.patientContact + '&appt=' + $scope.fields.appointmentId;

        $http.get(url)
            .success(function (patientAppointment) {
                $scope.fields.appointmentRemarks = patientAppointment.remarks;
            })

            .error(function () {
                console.log("Error getting patient's appointment remarks.");
            });

        for (var field in $scope.form) {
            $scope.form[field] = true;
        }

        $scope.showEditButtons = true;
    };

    /* function to navigate to date after selection on date picker */
    $scope.navigateToDate = function () {
        var selectedDate = $scope.getFormattedDate($scope.fields.appointmentDate);
        $('#drHoCalendar').fullCalendar('gotoDate', selectedDate);
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

    /* function to clear fields in form */
    $scope.clearForm = function () {
        $scope.fields = {};
        $scope.appointmentForm.$setPristine();
        $scope.appointmentForm.$setUntouched();
    };

    /* function to show appointment form */
    $scope.showForm = function (formType) {
        $scope.scaleDownCalendar = true;
        $scope.addAndBlockButtons = false;
        $scope.progressbar.start();
        $scope.progressbar.complete();

        $timeout(function () {
            $scope.showAppointmentForm = true;
        }, 1200);

        if (formType === 'Create') {
            // Perform these operations when showing the create appointment form
            $scope.showPatientList = false;
            $scope.showCreateButtons = true;
            $scope.formTitle = "Create New Appointment";

        } else if (formType === 'Edit') {
            // Perform these operations when showing the edit appointment form
            $scope.showPatientList = true;
            $scope.showCreateButtons = false;
            $scope.showEditButtons = false;
            $scope.formTitle = "Edit Appointment";
            $scope.disablePatientNameInput = true;
            $scope.disablePatientContactInput = true;
            $scope.disableAssignedDoctorInput = true;
            $scope.disableMktgChannelInput = true;

            for (var field in $scope.form) {
                $scope.form[field] = false;
            }

        } else {
            // Do nothing
        }
    };

    /* function to hide appointment form */
    $scope.hideForm = function () {
        $scope.scaleDownCalendar = false;
        $scope.showAppointmentForm = false;
        $scope.showEditButtons = false;
        $scope.showCreateButtons = false;
        $scope.disableISchedule();
        $scope.clearForm();
        $scope.disablePatientNameInput = false;
        $scope.disablePatientContactInput = false;
        $scope.disableAssignedDoctorInput = false;
        $scope.disableMktgChannelInput = false;
        $scope.showHeatMap = false;
        
        $timeout(function () {
            $scope.addAndBlockButtons = true;
        }, 1200);

        for (var field in $scope.form) {
            $scope.form[field] = true;
        }
    };

    /* function to enable iSchedule */
    $scope.enableISchedule = function () {
        if ($scope.formTitle === 'Create New Appointment') {
            $scope.showHeatMap = true;
            $scope.iSchedule = true;
            $scope.getHeatMap('appointmentType', 'doctorId');
            $scope.drHoScreenings.events.splice(0);
            $scope.drHoPreEvaluations.events.splice(0);
            $scope.drHoSurgeries.events.splice(0);
        }
    };

    /* function to disable iSchedule */
    $scope.disableISchedule = function () {
        if ($scope.formTitle === 'Create New Appointment' && $scope.iSchedule === true) {
            $scope.iSchedule = false;
            $scope.lowHeatMap.events.splice(0);
            $scope.medHeatMap.events.splice(0);
            $scope.highHeatMap.events.splice(0);
            $scope.getDrHoScreenings();
            $scope.getDrHoPreEvaluations();
            $scope.getDrHoSurgeries();
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
        }
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

/* service to search for patient's details based on contact */
appCalendar.service('searchContact', ['$http', function ($http) {
    return {
        search: function (contact) {
            var url = '/Clearvision/_api/patients/?search=' + contact;
            return $http.get(url);
        }
    }

    /* progress bar */
}]);