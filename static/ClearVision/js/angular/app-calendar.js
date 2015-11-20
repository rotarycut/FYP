var appCalendar = angular.module('app.calendar', ['ngProgress']);


appCalendar.controller('CalendarCtrl', function ($scope, $compile, uiCalendarConfig, $timeout, $http,
                                                 appointmentService, ngProgressFactory, $modal,
                                                 postAppointmentSvc, clearFormSvc, enableIScheduleSvc, disableIScheduleSvc,
                                                 deleteAppointmentSvc, updateAppointmentSvc, hideFormSvc, eventClickSvc,
                                                 filterAppointmentSvc, $interval, populatePatientsSvc, $log,
                                                 getApptTimingsSvc, showFormSvc, searchAppointmentsSvc, checkExistingPatientSvc,
                                                 changeCalendarSvc, getMarketingChannelsSvc, $route, postBlockerSvc,
                                                 populateBlockedFormSvc, getSwapApptsSvc, $rootScope, $filter, $pusher,
                                                 getAppointmentTypesColorService, suggestedAppointmentsSvc) {

    var client = new Pusher('6cb577c1e7b97150346b');
    var pusher = $pusher(client);

    $timeout(function () {
        $scope.socketId = pusher.connection.baseConnection.socket_id;
    }, 5000);

    $scope.$route = $route;
    var date = new Date();
    var d = date.getDate();
    var m = date.getMonth();
    var y = date.getFullYear();

    /* pass the scope to the post appointment service upon initialization */
    postAppointmentSvc.getScope($scope);
    postBlockerSvc.getScope($scope);
    clearFormSvc.getScope($scope);
    enableIScheduleSvc.getScope($scope);
    disableIScheduleSvc.getScope($scope);
    deleteAppointmentSvc.getScope($scope);
    updateAppointmentSvc.getScope($scope);
    hideFormSvc.getScope($scope);
    eventClickSvc.getScope($scope);
    filterAppointmentSvc.getScope($scope);
    populatePatientsSvc.getScope($scope);
    getApptTimingsSvc.getScope($scope);
    showFormSvc.getScope($scope);
    searchAppointmentsSvc.getScope($scope);
    checkExistingPatientSvc.getScope($scope);
    changeCalendarSvc.getScope($scope);
    populateBlockedFormSvc.getScope($scope);
    suggestedAppointmentsSvc.getScope($scope);

    /* --- start of declaration of event source that contains custom events on the scope --- */

    $scope.tempLowHeatMap = {
        color: '#00B499',
        textColor: 'White',
        events: []
    };

    $scope.tempMedHeatMap = {
        color: '#FF9966',
        textColor: 'White',
        events: []
    };

    $scope.tempHighHeatMap = {
        color: '#EA525F',
        textColor: 'White',
        events: []
    };

    $scope.blockedHeatMap = {
        color: '#181818   ',
        textColor: 'White',
        events: []
    };

    $scope.selectedDoctor = {
        drAppointmentArray: $scope.doctorHoAppointments,
        drScreening: '',
        drPreEval: $scope.drHoPreEvaluations,
        drSurgery: $scope.drHoSurgeries,
        drEyeCare: ''
    };

    /* --- end of declaration --- */


    /* function to get heat map */
    $scope.getHeatMap = function (appointmentType, doctorId) {

        var lowHeatUrl = '/Clearvision/_api/HeatMap/?monthsAhead=2&timeslotType=' + appointmentType + '&upperB=1&lowerB=0&docName=' + doctorId;
        var medHeatUrl = '/Clearvision/_api/HeatMap/?monthsAhead=2&timeslotType=' + appointmentType + '&upperB=3&lowerB=2&docName=' + doctorId;
        var highHeatUrl = '/Clearvision/_api/HeatMap/?monthsAhead=2&timeslotType=' + appointmentType + '&upperB=15&lowerB=4&docName=' + doctorId;
        var blockUrl = '/Clearvision/_api/CalendarBlocker/?doctor=' + doctorId;

        $http.get(lowHeatUrl)
            .success(function (listOfAppointments) {

                var count = 0;
                angular.forEach(listOfAppointments, function (appointment) {

                    //appointment.title = appointment.patientcount + " patient(s)";
                    if (count <= 651) {
                        //$scope.drGohLowHeatMap.events.push(appointment);
                        $scope.tempLowHeatMap.events.push(appointment);

                        count++;
                    } else {
                        //return;
                    }

                });

                $scope.addEventSource($scope.chosenDoctor.doctorAppointmentSource, $scope.tempLowHeatMap);
                $rootScope.spinner = {active: false};

                // enable appointment type field to be change only after loading heat map completely
                $scope.form.disableFields.disabledApptType = false;
                $scope.form.disableFields.doctor = false;
                $scope.form.backBtn = false;
            }).error(function () {
                $rootScope.spinner = {active: false};
            });

        $http.get(medHeatUrl)
            .success(function (listOfAppointments) {
                var count = 0;
                angular.forEach(listOfAppointments, function (appointment) {
                    //appointment.title = appointment.patientcount + " patient(s)";
                    if (count <= 651) {
                        //$scope.drHoMedHeatMap.events.push(appointment);
                        //$scope.drGohMedHeatMap.events.push(appointment);
                        $scope.tempMedHeatMap.events.push(appointment);

                        count++;
                    } else {
                        //return;
                    }
                });

                $scope.addEventSource($scope.chosenDoctor.doctorAppointmentSource, $scope.tempMedHeatMap);
            });

        $http.get(highHeatUrl)
            .success(function (listOfAppointments) {
                var count = 0;
                angular.forEach(listOfAppointments, function (appointment) {
                    //appointment.title = appointment.patientcount + " patient(s)";
                    if (count <= 651) {
                        //$scope.drHoHighHeatMap.events.push(appointment);
                        //$scope.drGohHighHeatMap.events.push(appointment);
                        $scope.tempHighHeatMap.events.push(appointment);

                        count++;
                    } else {
                        //return;
                    }
                });

                $scope.addEventSource($scope.chosenDoctor.doctorAppointmentSource, $scope.tempHighHeatMap);
            });

        $http.get(blockUrl)
            .success(function (listOfBlockedTimeSlots) {
                angular.forEach(listOfBlockedTimeSlots, function (timeSlot) {

                    $scope.blockedHeatMap.events.push(timeSlot);
                });

                $scope.addEventSource($scope.chosenDoctor.doctorAppointmentSource, $scope.blockedHeatMap);
            });

    };

    /* event source that calls a function on every view switch */
    $scope.eventF = function (start, end, timezone, callback) {

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

    /* add an event source of choice only if it does not already exist in the source array */
    $scope.addEventSource = function (sources, source) {
        var canAdd = 0;
        angular.forEach(sources, function (value, key) {
            if (sources[key] === source) {
                canAdd = 1;
            }
        });
        if (canAdd === 0) {
            sources.push(source);
        }
    };

    /* removes an event source of choice */
    $scope.removeEventSource = function (sources, source) {
        angular.forEach(sources, function (value, key) {
            if (sources[key] === source) {
                sources.splice(key, 1);
            }
        });
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
        $scope.currentView = view;
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
            var tooltip = event.tooltip;

        } catch (Exception) {
            return;
        }

        try {
            var listOfPatients = event.patients;

            listOfPatients.forEach(function (patient) {
                strOfPatientNames += patient.name;
                strOfPatientNames += '\r\n';
            });

        } catch (Exception) {

            strOfPatientNames = event.tooltip;
            return strOfPatientNames;
        }

        return strOfPatientNames;
    };

    /* config object */
    $scope.uiConfig = {
        calendar: {
            //height: 500,
            editable: true,
            header: {
                left: 'title',
                center: '',
                right: 'today prev,next'
            },
            fixedWeekCount: false,
            eventStartEditable: false,
            eventDurationEditable: false,
            eventClick: $scope.alertOnEventClick,
            eventRender: $scope.eventRender,
            allDaySlot: false,
            slotEventOverlap: false,
            firstDay: 1,
            viewRender: function (view, element) {

                var doctorCalendar = '#' + $scope.allDoctorsVariables[$scope.chosenDoctor.calendarTag].calendar;

                var calendarStartDate = $(doctorCalendar).fullCalendar('getView').intervalStart._d;
                var calendarEndDate = $(doctorCalendar).fullCalendar('getView').intervalEnd._d;
                calendarEndDate = moment(calendarEndDate).subtract(1, 'days')._d;

                var filteredStartDate = $filter('date')(calendarStartDate, 'yyyy-MM-dd');
                var filteredEndDate = $filter('date')(calendarEndDate, 'yyyy-MM-dd');

                if ($scope.iSchedule) {

                } else {
                    $scope.trackCalendar($scope.currentView, filteredStartDate, filteredEndDate);
                }

            }
        }
    };

    /*******************************************************************************
     function to get calendar time range
     *******************************************************************************/

    $scope.getCalendarTimeRange = function () {

        $http.get('/Clearvision/_api/ViewCalendarTimeRange/1/')
            .success(function (calendarTimings) {

                $scope.uiConfig.calendar.minTime = calendarTimings.startTime;
                $scope.uiConfig.calendar.maxTime = calendarTimings.endTime;
            });
    };

    $scope.getCalendarTimeRange();

    /*******************************************************************************
     function to initialize doctors calendars
     *******************************************************************************/

    $scope.getDoctorsVariables = function () {

        // activate loading spinner
        $rootScope.spinner = {active: true};

        $http.get('/Clearvision/_api/DoctorCalendarSideTab/')
            .success(function (doctorsVariables) {

                // loop through each doctor set of variables
                angular.forEach(doctorsVariables, function (doctor) {

                    doctor.active = JSON.parse('false');
                    doctor.disable = JSON.parse('false');

                    // set doctor appointment source to an empty array
                    $scope[doctor.doctorAppointmentSource] = [];
                    doctor.doctorAppointmentSource = $scope[doctor.doctorAppointmentSource];

                    // for each appointment type, create appointment event array
                    angular.forEach(doctor.appointmentTypeColorArray, function (appointmentType) {

                        // create doctor appointment type event
                        $scope[appointmentType.type] = {
                            color: appointmentType.color,
                            textColor: appointmentType.textColor,
                            events: []
                        }

                    });

                });

                // set first doctor calendar to be the active calendar
                doctorsVariables[0].active = true;

                $scope.allDoctorsVariables = doctorsVariables;

                $scope.chosenDoctor = $scope.allDoctorsVariables[0];

            })
    };

    $scope.getDoctorsVariables();

    /*******************************************************************************
     function to track calendar navigation
     *******************************************************************************/

    $scope.trackCalendar = function (currentView, startDate, endDate) {

        // example parameters
        // currentView : 'agendaWeek'
        // startDate : '2015-10-01'
        // endDate : '2015-10-31'

        $timeout(function () {
            $scope.removeFromDoctorSource(
                $scope.chosenDoctor.doctorAppointmentSource,
                $scope.chosenDoctor.appointmentTypeSourceArray,
                true
            );

            $scope.getDoctorAppointments(
                $scope.chosenDoctor.doctorId,
                $scope.chosenDoctor.appointmentTypeArray,
                $scope.chosenDoctor.doctorAppointmentSource,
                $scope.chosenDoctor.appointmentTypeSourceArray,
                startDate,
                endDate
            );

        }, 0);

    };

    /*******************************************************************************
     function to add/remove appointment type source to doctors' appointment source
     *******************************************************************************/

    $scope.addToDoctorSource = function (doctorAppointmentSource, appointmentTypeSourceArray) {

        // example parameters
        // doctorAppointmentSource : $scope.doctorHoAppointments
        // appointmentTypeSourceArray : [drHoPreEvaluations, drHoSurgeries, drHoPostSurgeries]

        angular.forEach(appointmentTypeSourceArray, function (appointmentType) {

            $scope.addEventSource(doctorAppointmentSource, $scope[appointmentType]);
        });

    };

    $scope.removeFromDoctorSource = function (doctorAppointmentSource, appointmentTypeSourceArray, clearAppointmentSource) {

        // example parameters
        // doctorAppointmentSource : $scope.doctorHoAppointments
        // appointmentTypeSourceArray : [drHoPreEvaluations, drHoSurgeries, drHoPostSurgeries]
        // clearAppointmentSource : true

        angular.forEach(appointmentTypeSourceArray, function (appointmentType) {

            $scope.removeEventSource(doctorAppointmentSource, $scope[appointmentType]);

            if (clearAppointmentSource) {

                // if true, clear all the appointments in the appointment type source
                var lengthOfAppointmentTypeSource = $scope[appointmentType].events.length;
                $scope[appointmentType].events.splice(0, lengthOfAppointmentTypeSource);
            }
        });

    };

    /*******************************************************************************
     function to retrieve doctor's appointments
     *******************************************************************************/

    $scope.getDoctorAppointments = function (doctorId, appointmentTypeArray, doctorAppointmentSource, appointmentTypeSourceArray, startDate, endDate) {

        // example parameters
        // doctorName : 1'
        // appointmentTypeArray :  ['Pre Evaluation', 'Surgery', 'Post Surgery']
        // doctorAppointmentSource : $scope.doctorHoAppointments
        // appointmentTypeSourceArray : ['drHoPreEvaluations', 'drHoSurgeries', 'drHoPostSurgeries']
        // startDate : '2015-01-01'
        // endDate : '2015-01-31'
        // year : '2015'

        // activate loading spinner
        $rootScope.spinner = {active: true};

        appointmentService.getDoctorAppointments(doctorId, appointmentTypeArray, startDate, endDate)
            .then(function (retrievedAppointments) {

                var count = 0;

                // loop through the appointment type source array, eg: drHoPreEvaluations, drHoSurgeries, drHoPostSurgeries
                angular.forEach(appointmentTypeSourceArray, function (source) {

                    // loop through the appointments for each appointment type
                    angular.forEach(retrievedAppointments[count].data, function (appointment) {

                        // for each appointment type source object, push in all the respective appointments
                        $scope[source].events.push(appointment);
                    });

                    count++;
                });

                $timeout(function () {

                    // add the appointment type source array to the doctor appointment source
                    // $scope.drHoSurgery,$scope.drHoPreEvaluation into $scope.doctorHoAppointments
                    $scope.addToDoctorSource(doctorAppointmentSource, appointmentTypeSourceArray);
                }, 0);

                // de-active spinner once the appointments are loaded into the calendar
                $rootScope.spinner.active = false;


            }, function (data) {

                $rootScope.spinner.active = false;
                $log.error("Failed to retrieve promises for doctors' appointments.");
            });

    };

    /*******************************************************************************
     date picker codes
     *******************************************************************************/

    $scope.datepickers = {
        showDatePicker: false,
        showDatePicker2: false
    };
    $scope.disabled = function (date, mode) {
        return ( mode === 'day' && (date.getDay() === 0));
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


    /*******************************************************************************
     initialization when page first loads
     *******************************************************************************/

    $scope.fields = {};
    $scope.blockFields = {};
    //$scope.fields.marketingChannel = {};
    //$scope.fields.marketingChannel.name = "";
    $scope.remarkWarning = "Please select a patient";
    $scope.screeningActive = true;
    $scope.preEvaluationActive = true;
    $scope.surgeryActive = true;
    $scope.showFilters = true;
    $scope.progressbar = ngProgressFactory.createInstance();
    $scope.legendScreenClicked = "legend-screen-clicked";
    $scope.legendEvalClicked = "legend-preEval-clicked";
    $scope.legendSurgeryClicked = "legend-surgery-clicked";
    $scope.legendPostOpClicked = "legend-postop-clicked";
    $scope.legendEyecareClicked = "legend-eyecare-clicked";
    $scope.screenIconChange = "fa fa-check-square";
    $scope.preEvalIconChange = "fa fa-check-square";
    $scope.surgeryIconChange = "fa fa-check-square";
    $scope.postOpIconChange = "fa fa-check-square";
    $scope.eyecareIconChange = "fa fa-check-square";
    $scope.disabledApptType = false;
    $scope.hideFormToggle = true;
    $scope.showDoctorLegend = true;
    $scope.showOptomLegend = false;

    $scope.form = {
        showForm: false,
        showBlockForm: false,
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
            //patientName: false,
            //contact: false,
            doctor: false,
            marketingChannel: false
        },
        showButtons: {
            createForm: false,
            editForm: false,
            addAndBlock: true,
        },
        showBlcokButtons: {
            createBlockForm: true,
            editBlockForm: false,
        },
        showSuggestedSlot: false,
        suggestedSlotList: false
    };

    $scope.disableSearchBox = false;
    /* different lists to populate form. will subsequently get from backend */
    $scope.listOfSuggestedAppointments = [];
    $scope.listOfAppointmentTypes = [];
    $scope.operationTimings = ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30", "18:00"];
    //$scope.listOfMarketingChannels = ["987 Radio", "Andrea Chong Blog", "Channel News Asia", "Referred by Doctor", "ST Ads", "Others"];
    $scope.listOfMarketingChannels = [];
    $scope.listOfDoctors = [];
    $scope.selectedCalendar = "myCalendar1";
    $scope.drHoCalendar = true;
    $scope.drGohCalendar = false;

    /* function to retrieve all marketing channels */
    $scope.getMarketingChannels = function () {
        getMarketingChannelsSvc.getMarketingChannels()
            .then(function (listOfChannels) {

                angular.forEach(listOfChannels, function (channel) {
                    $scope.listOfMarketingChannels.push(channel);
                });

            });
    };

    /* function to show appointment form */
    $scope.showBlockForm = function () {
        showFormSvc.showBlockForm();
    };

    /* function to show blocker form */
    $scope.showForm = function (formType) {
        showFormSvc.showForm(formType);
    };

    /* function to retrieve list of appointment timings */
    $scope.getAppointmentTimings = function (populateTiming, isWaitList) {
        getApptTimingsSvc.getAppointmentTimings(populateTiming, isWaitList);
    };

    /* function to populate patient details upon selection on the edit appointment form */
    $scope.populatePatientDetails = function () {
        populatePatientsSvc.populatePatientDetails();
    };

    /* function to hide appointment form */
    $scope.hideForm = function () {
        hideFormSvc.hideForm();
    };

    /* function to hide block form */
    $scope.hideBlockForm = function () {
        hideFormSvc.hideBlockForm();
    };

    /* function to clear appointment form */
    $scope.clearForm = function () {
        clearFormSvc.clearForm();
    };

    /* function to clear block form */
    $scope.clearBlockForm = function () {
        clearFormSvc.clearBlockForm();
    };

    /* function to enable iSchedule */
    $scope.enableISchedule = function () {
        enableIScheduleSvc.enableISchedule();
    };

    /* function to filter by appointment types */
    $scope.filterByAppointmentTypes = function (appointmentType, hidesTheRest) {
        filterAppointmentSvc.filterByAppointmentTypes(appointmentType, hidesTheRest);
    };

    /* function to change filter legend */
    $scope.toggleFilter = function (appointmentType, hidesTheRest) {
        filterAppointmentSvc.toggleFilter(appointmentType, hidesTheRest);
    };

    /* function to search for patient appointments in search box */
    $scope.searchForAppt = function (searchValue) {
        return searchAppointmentsSvc.searchForAppt(searchValue);
    };

    /* function to be notified of existing patients when typing contact number on form */
    $scope.checkExistingPatient = function (searchValue) {
        return checkExistingPatientSvc.checkExistingPatient(searchValue);
    };

    /* function to change calendar, setting active calendar tab */
    $scope.changeCalendar = function (calendarNumber, tabDisabled, clickOnTab, isFromSearch) {
        changeCalendarSvc.changeCalendar(calendarNumber, tabDisabled, clickOnTab, isFromSearch);
    };

    /* function to set current selected dr scope */
    $scope.changeSelectedDoctor = function (drSourceArray, drScreenings, drPreEval, drSurgery) {
        changeCalendarSvc.changeSelectedDoctor(drSourceArray, drScreenings, drPreEval, drSurgery);
    };

    /* function to splice appointments */
    $scope.spliceAppointment = function (appointmentsInType, retrievedAppointmentId) {
        var appointmentIndex = 0;
        angular.forEach(appointmentsInType, function (existingAppointment) {
            if (existingAppointment.id === retrievedAppointmentId) {
                appointmentsInType.splice(appointmentIndex, 1);
            }
            appointmentIndex++;
        });
    };

    /* function to navigate to date after selection on date picker field */
    $scope.navigateToDate = function () {
        var selectedDate = $scope.getFormattedDate($scope.fields.appointmentDate);
        var calendarTag = '#' + $scope.chosenDoctor.calendar;

        $(calendarTag).fullCalendar('gotoDate', selectedDate);
    };

    /* function to format waiting list date */
    $scope.formatWaitingListDate = function () {
        $scope.fields.waitingDate = $scope.getFormattedDate($scope.fields.waitingDate);
    };

    /* function to get format date */
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

    /* function to get format time */
    $scope.getFormattedTime = function (fullTime) {

        var lastSpaceIndex = fullTime.lastIndexOf(" ");

        var formattedTime = fullTime.substring(lastSpaceIndex);

        return formattedTime;
    };

    /* function to get all the doctors */
    $scope.getAllDoctors = function () {
        $http.get('/Clearvision/_api/doctors/')
            .success(function (data) {
                $scope.fixedListOfDoctors = data;
                $scope.listOfDoctors = data;
            });
    };

    /* function to format block date */
    $scope.formatBlockStartDate = function () {
        $scope.blockFields.blockDateStart = $scope.getFormattedDate($scope.blockFields.blockDateStart);
    };

    $scope.formatBlockEndDate = function () {
        $scope.blockFields.blockDateEnd = $scope.getFormattedDate($scope.blockFields.blockDateEnd);
    };

    /* function for checkbox to block full day */
    $scope.blockDay = function (checkBoxIsTick) {
        if (checkBoxIsTick) {
            $scope.blockFields.blockTimeStart = "09:00";
            $scope.blockFields.blockTimeEnd = "18:00";
        } else {
            $scope.blockFields.blockTimeStart = "";
            $scope.blockFields.blockTimeEnd = "";
        }
    };

    /* function to get list of doctor based on appointment type chosen */
    $scope.getDoctorAppointmentTypes = function () {

        $scope.form.disableFields.doctor = true;

        var apptTypeId = $scope.fields.appointmentType.id;

        $http.get('/Clearvision/_api/DoctorApptTypes/?apptTypeID=' + apptTypeId)
            .success(function (listOfDoctors) {
                $scope.listOfDoctors = listOfDoctors;

                // make sure that the doctor field is previously filled
                if ($scope.fields.doctorAssigned != undefined) {

                    // if appointment type field is changed, but the doctor is still present in the new rendered list, should still display the doctor
                    var indexOfDoctorInList = 0;
                    angular.forEach(listOfDoctors, function (doctor) {
                        if (doctor.id === $scope.fields.doctorAssigned.id) {
                            $scope.fields.doctorAssigned = $scope.listOfDoctors[indexOfDoctorInList];
                        }
                        indexOfDoctorInList++;
                    });
                }

                $scope.form.disableFields.doctor = false;

            });
    };

    /* function to get list of appointment types */
    $scope.getListOfAppointmentTypes = function () {
        $http.get('/Clearvision/_api/ViewAllApptTypes/')
            .success(function (listOfAppointmentTypes) {
                $scope.listOfAppointmentTypes = listOfAppointmentTypes;
            });
    };


    /*******************************************************************************
     function to show waiting fields on form
     *******************************************************************************/


    $scope.showWaitingFields = function (showFields) {
        if (showFields === 'yes') {
            $scope.showWaitingDate = true;
            $scope.showWaitingTime = true;
        } else {
            $scope.showWaitingDate = false;
            $scope.showWaitingTime = false;
        }
    };

    /* iSchedule list */
    $scope.showTimeList = function (date) {
        date.active = !date.active;
    };

    $scope.showLeastPackedSlots = function (date) {
        date.active = !date.active;
    };


    /*******************************************************************************
     form validations
     *******************************************************************************/


    /* function to validate create appointment */
    $scope.isFormValid = function (isValid) {

        console.log($scope.fields.appointmentDate);

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

    $scope.isBlockFormValid = function (isValid) {
        if (isValid) {
            $scope.openBlockedConfirmationModal('lg');
        } else {
            console.log("Invalid form");
            // do nothing
        }
    };

    $scope.isEditBlockFormValid = function (isValid) {
        if (isValid) {
            $scope.openUpdateBlockModal('lg');
        } else {
            console.log("Invalid form");
            // do nothing
        }
    };


    /*******************************************************************************
     on select of patient after keying in contact no
     *******************************************************************************/


    $scope.selectPatient = function ($item, $model, $label, appt) {

        $scope.fields.patientContact = $item.contact;
        $scope.fields.patientName = $item.name;

        var idx = 0;
        var channelIndex = 0;

        angular.forEach($scope.listOfMarketingChannels, function (channel) {

            if (channel.id == $item.marketingChannelId) {
                channelIndex = idx;
            }
            idx++;

        });

        $scope.fields.marketingChannel = $scope.listOfMarketingChannels[channelIndex];

        // disable marketing channel field on select of patient
        $scope.form.disableFields.marketingChannel = true;
    };


    /*******************************************************************************
     function after selecting an appointment from the search box result
     *******************************************************************************/


    $scope.onSelect = function ($item, $model, $label) {

        // discover which doctor appointment is selected
        var lastCommar = $item.lastIndexOf(",");
        var formatStr = $item.substring(0, lastCommar);
        var secondLastCommar = formatStr.lastIndexOf(",", formatStr);
        var doctor = $item.substring(secondLastCommar + 2, lastCommar);

        // discover appointment date
        var commarIndex = $item.indexOf(",");
        var date = $item.substring(0, commarIndex);

        // discover doctor change calendar tag & doctor calendar tag
        var changeCalendarTag;
        var doctorCalendarTag;

        angular.forEach($scope.allDoctorsVariables, function (doctorCalendar) {
            if (doctorCalendar.title == doctor) {
                changeCalendarTag = doctorCalendar.changeCalendar;
                doctorCalendarTag = '#' + doctorCalendar.calendar;
            }
        });

        $scope.searchedDoctor = doctor;

        // change the calendar view to the day view
        $scope.changeView('agendaDay', changeCalendarTag);

        // navigate the calendar to the appointment date
        $(doctorCalendarTag).fullCalendar('gotoDate', date);

        // change the calendar tab and set variables, doesnt matter if it is edit >1 patients and showing patient list since giving default false
        $scope.changeCalendar(changeCalendarTag, false, false, true);

        // clear the search box text
        $scope.searchText = "";
    };


    /*******************************************************************************
     check timing
     *******************************************************************************/


    $scope.checkTiming = function () {
        var date = new Date();
        var hour = date.getHours();
        var minutes = date.getMinutes();

        var time = $scope.fields.appointmentTime;
        var colon = time.indexOf(":");
        var selectedHour = time.substring(0, colon);
        var selectedMinute = time.substring(colon + 1);

        if (hour > selectedHour || (hour == selectedHour && time > selectedMinute)) {
            $scope.fields.appointmentTime = "";
        }

        //console.log(selectedHour);
        //console.log(selectedMinute);

    };


    /*******************************************************************************
     pusher
     *******************************************************************************/


    var my_presence_channel = pusher.subscribe('appointmentsCUD');
    my_presence_channel.bind('createAppt', function (appointment) {

        $log.debug("Receiving socket request to create appointment");


    });

    pusher.subscribe('appointmentsCUD', 'createAppt', function (appointment) {


        $log.debug("Receiving socket request to create appointment");
        console.log(appointment);

        /*$scope.removeEventSource($scope.doctorHoAppointments, $scope.drHoPreEvaluations);
         $scope.removeEventSource($scope.doctorHoAppointments, $scope.drHoSurgeries);
         $scope.removeEventSource($scope.doctorHoAppointments, $scope.drHoPostSurgeries);
         $scope.removeEventSource($scope.doctorGohAppointments, $scope.drGohPreEvaluations);
         $scope.removeEventSource($scope.doctorGohAppointments, $scope.drGohSurgeries);
         $scope.removeEventSource($scope.doctorGohAppointments, $scope.drGohPostSurgeries);
         $scope.removeEventSource($scope.optomAppointments, $scope.optomScreenings);
         $scope.removeEventSource($scope.optomAppointments, $scope.optomEyeCare);

         $scope.drHoPreEvaluations.events.splice(0, $scope.drHoPreEvaluations.events.length);
         $scope.drHoSurgeries.events.splice(0, $scope.drHoSurgeries.events.length);
         $scope.drHoPostSurgeries.events.splice(0, $scope.drHoPostSurgeries.events.length);
         $scope.drGohPreEvaluations.events.splice(0, $scope.drGohPreEvaluations.events.length);
         $scope.drGohSurgeries.events.splice(0, $scope.drGohSurgeries.events.length);
         $scope.drGohPostSurgeries.events.splice(0, $scope.drGohPostSurgeries.events.length);
         $scope.optomScreenings.events.splice(0, $scope.optomScreenings.events.length);
         $scope.optomEyeCare.events.splice(0, $scope.optomEyeCare.events.length);

         $scope.getDrHoAppointments($scope.iSchedule);
         $scope.getDrGohAppointments($scope.iSchedule);
         $scope.getOptomAppointments($scope.iSchedule);*/

    });

    //console.log(Pusher.connection);

    //console.log(channel);
    //console.log(channel.$$state);

    /*console.log(Pusher.connectionState());

     var channel2 = Pusher.subscribe('appointmentsCUD', 'updateAppt', function (appointment) {

     $timeout(function () {

     $log.debug("Receiving socket request to update appointment");

     $scope.removeEventSource($scope.doctorHoAppointments, $scope.drHoPreEvaluations);
     $scope.removeEventSource($scope.doctorHoAppointments, $scope.drHoSurgeries);
     $scope.removeEventSource($scope.doctorHoAppointments, $scope.drHoPostSurgeries);
     $scope.removeEventSource($scope.doctorGohAppointments, $scope.drGohPreEvaluations);
     $scope.removeEventSource($scope.doctorGohAppointments, $scope.drGohSurgeries);
     $scope.removeEventSource($scope.doctorGohAppointments, $scope.drGohPostSurgeries);
     $scope.removeEventSource($scope.optomAppointments, $scope.optomScreenings);
     $scope.removeEventSource($scope.optomAppointments, $scope.optomEyeCare);

     $scope.drHoPreEvaluations.events.splice(0, $scope.drHoPreEvaluations.events.length);
     $scope.drHoSurgeries.events.splice(0, $scope.drHoSurgeries.events.length);
     $scope.drHoPostSurgeries.events.splice(0, $scope.drHoPostSurgeries.events.length);
     $scope.drGohPreEvaluations.events.splice(0, $scope.drGohPreEvaluations.events.length);
     $scope.drGohSurgeries.events.splice(0, $scope.drGohSurgeries.events.length);
     $scope.drGohPostSurgeries.events.splice(0, $scope.drGohPostSurgeries.events.length);
     $scope.optomScreenings.events.splice(0, $scope.optomScreenings.events.length);
     $scope.optomEyeCare.events.splice(0, $scope.optomEyeCare.events.length);

     $scope.getDrHoAppointments($scope.iSchedule);
     $scope.getDrGohAppointments($scope.iSchedule);
     $scope.getOptomAppointments($scope.iSchedule);

     $timeout(function () {
     getSwapApptsSvc.getNumberOfSwappableAppointments();
     }, 2000);

     }, 3500);

     });

     //console.log(channel2);

     /*
     Pusher.subscribe('appointmentsCUD', 'deleteAppt', function (appointment) {

     $timeout(function () {

     $log.debug("Receiving socket request to delete appointment");

     // heat map is disabled when socket sends in some data
     $scope.removeEventSource($scope.doctorHoAppointments, $scope.drHoPreEvaluations);
     $scope.removeEventSource($scope.doctorHoAppointments, $scope.drHoSurgeries);
     $scope.removeEventSource($scope.doctorHoAppointments, $scope.drHoPostSurgeries);
     $scope.removeEventSource($scope.doctorGohAppointments, $scope.drGohPreEvaluations);
     $scope.removeEventSource($scope.doctorGohAppointments, $scope.drGohSurgeries);
     $scope.removeEventSource($scope.doctorGohAppointments, $scope.drGohPostSurgeries);
     $scope.removeEventSource($scope.optomAppointments, $scope.optomScreenings);
     $scope.removeEventSource($scope.optomAppointments, $scope.optomEyeCare);

     $scope.drHoPreEvaluations.events.splice(0, $scope.drHoPreEvaluations.events.length);
     $scope.drHoSurgeries.events.splice(0, $scope.drHoSurgeries.events.length);
     $scope.drHoPostSurgeries.events.splice(0, $scope.drHoPostSurgeries.events.length);
     $scope.drGohPreEvaluations.events.splice(0, $scope.drGohPreEvaluations.events.length);
     $scope.drGohSurgeries.events.splice(0, $scope.drGohSurgeries.events.length);
     $scope.drGohPostSurgeries.events.splice(0, $scope.drGohPostSurgeries.events.length);
     $scope.optomScreenings.events.splice(0, $scope.optomScreenings.events.length);
     $scope.optomEyeCare.events.splice(0, $scope.optomEyeCare.events.length);

     $scope.getDrHoAppointments($scope.iSchedule);
     $scope.getDrGohAppointments($scope.iSchedule);
     $scope.getOptomAppointments($scope.iSchedule);

     $timeout(function () {
     getSwapApptsSvc.getNumberOfSwappableAppointments();
     }, 2000);


     }, 3500);

     });*/


    /*******************************************************************************
     modal codes
     *******************************************************************************/


    $scope.animationsEnabled = true;

    /* function to open create modal */
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
                },
                createTracker: function () {

                    return $scope.trackId;
                },
                appointment: function () {
                    return '';
                },
                blockInfo: function () {
                    return "";
                }
            }
        });

    };

    /* function to open delete modal */
    $scope.openDeleteModal = function (size) {

        var modalInstance = $modal.open({
            animation: $scope.animationsEnabled,
            templateUrl: 'myDeleteModalContent.html',
            controller: 'ModalInstanceCtrl',
            size: size,
            resolve: {
                patientInfo: function () {
                    return $scope.fields;
                },
                createTracker: function () {
                    return $scope.trackId;
                },
                appointment: function () {
                    return '';
                },
                blockInfo: function () {
                    return "";
                }
            }
        });
    };

    /* function to open update modal */
    $scope.openUpdateModal = function (size) {

        var modalInstance = $modal.open({
            animation: $scope.animationsEnabled,
            templateUrl: 'myUpdateModalContent.html',
            controller: 'ModalInstanceCtrl',
            size: size,
            resolve: {
                patientInfo: function () {

                    if ($scope.fields.originalAppointmentDate.getTime() !== $scope.fields.appointmentDate.getTime()) {
                        $scope.fields.dateIsChanged = true;
                    } else {
                        $scope.fields.dateIsChanged = false;
                    }
                    if ($scope.fields.originalAppointmentTime !== $scope.fields.appointmentTime) {
                        $scope.fields.timeIsChanged = true;
                    } else {
                        $scope.fields.timeIsChanged = false;
                    }
                    if ($scope.fields.originalAppointmentType !== $scope.fields.appointmentType.name) {
                        $scope.fields.typeIsChanged = true;
                    } else {
                        $scope.fields.typeIsChanged = false;
                    }
                    if ($scope.fields.originalAppointmentRemarks !== $scope.fields.appointmentRemarks) {
                        $scope.fields.remarksIsChanged = true;
                    } else {
                        $scope.fields.remarksIsChanged = false;
                    }
                    if ($scope.fields.originalPatientContact !== $scope.fields.patientContact) {
                        $scope.fields.contactIsChanged = true;
                    } else {
                        $scope.fields.contactIsChanged = false;
                    }
                    if ($scope.fields.originalPatientName !== $scope.fields.patientName) {
                        $scope.fields.nameIsChanged = true;
                    } else {
                        $scope.fields.nameIsChanged = false;
                    }
                    if ($scope.fields.originalAppointmentDoctor !== $scope.fields.doctorAssigned.name) {
                        $scope.fields.doctorIsChanged = true;
                    } else {
                        $scope.fields.doctorIsChanged = false;
                    }

                    return $scope.fields;
                },
                createTracker: function () {
                    return $scope.trackId;
                },
                appointment: function () {
                    return '';
                },
                blockInfo: function () {
                    return "";
                }
            }
        });
    };

    /* function to open blocked appointment notification modal */
    $scope.openBlockedModal = function (size, appointment) {

        var modalInstance = $modal.open({
            animation: $scope.animationsEnabled,
            templateUrl: 'myBlockedAppointmentModalContent.html',
            controller: 'ModalInstanceCtrl',
            size: size,
            resolve: {
                patientInfo: function () {
                    return $scope.fields;
                },
                createTracker: function () {
                    return $scope.trackId;
                },
                appointment: function () {
                    return appointment;
                },
                blockInfo: function () {
                    return "";
                }
            }
        });
    };

    /* function to open blocked confirmation modal */
    $scope.openBlockedConfirmationModal = function (size, appointment) {

        var modalInstance = $modal.open({
            animation: $scope.animationsEnabled,
            templateUrl: 'myBlockedConfirmationModalContent.html',
            controller: 'ModalInstanceCtrl',
            size: size,
            resolve: {
                patientInfo: function () {
                    return $scope.fields;
                },
                createTracker: function () {
                    return $scope.trackId;
                },
                appointment: function () {
                    return appointment;
                },
                blockInfo: function () {
                    return $scope.blockFields;
                }
            }
        });
    };

    /* function to open update blocked time slots modal */
    $scope.openUpdateBlockModal = function (size, appointment) {

        var modalInstance = $modal.open({
            animation: $scope.animationsEnabled,
            templateUrl: 'myUpdateBlockModalContent.html',
            controller: 'ModalInstanceCtrl',
            size: size,
            resolve: {
                patientInfo: function () {
                    return $scope.fields;
                },
                createTracker: function () {
                    return $scope.trackId;
                },
                appointment: function () {
                    return appointment;
                },
                blockInfo: function () {

                    if ($scope.blockFields.originalBlockForm.doctor__name !== $scope.blockFields.doctorToBlock.name) {
                        $scope.blockFields.doctorIsChanged = true;
                    } else {
                        $scope.blockFields.doctorIsChanged = false;
                    }
                    if ($scope.blockFields.originalBlockForm.blockDateStart.getTime() !== $scope.blockFields.blockDateStart.getTime()) {
                        $scope.blockFields.startDateIsChanged = true;
                    } else {
                        $scope.blockFields.startDateIsChanged = false;
                    }
                    if ($scope.blockFields.originalBlockForm.blockTimeStart !== $scope.blockFields.blockTimeStart) {
                        $scope.blockFields.startTimeIsChanged = true;
                    } else {
                        $scope.blockFields.startTimeIsChanged = false;
                    }
                    if ($scope.blockFields.originalBlockForm.blockDateEnd.getTime() !== $scope.blockFields.blockDateEnd.getTime()) {
                        $scope.blockFields.endDateIsChanged = true;
                    } else {
                        $scope.blockFields.endDateIsChanged = false;
                    }
                    if ($scope.blockFields.originalBlockForm.blockTimeEnd !== $scope.blockFields.blockTimeEnd) {
                        $scope.blockFields.endTimeIsChanged = true;
                    } else {
                        $scope.blockFields.endTimeIsChanged = false;
                    }
                    if ($scope.blockFields.originalBlockForm.remarks !== $scope.blockFields.blockFormRemarks) {
                        $scope.blockFields.remarksIsChanged = true;
                    } else {
                        $scope.blockFields.remarksIsChanged = false;
                    }

                    return $scope.blockFields;
                }
            }
        });
    };

    /* function to open list of blocked time slots modal */
    $scope.openBlockedTimeSlotListModal = function (size) {

        var modalInstance = $modal.open({
            animation: $scope.animationsEnabled,
            templateUrl: 'myBlockedTimeSlotListModal.html',
            controller: 'ModalInstanceCtrl',
            size: size,
            resolve: {
                patientInfo: function () {
                    return '';
                },
                createTracker: function () {
                    return '';
                },
                appointment: function () {
                    return '';
                },
                blockInfo: function () {
                    return '';
                }
            }
        });
    };

    /* function to open delete blocked form modal */
    $scope.openDeleteBlockedFormModal = function (size) {

        var modalInstance = $modal.open({
            animation: $scope.animationsEnabled,
            templateUrl: 'myDeleteBlockedModalContent.html',
            controller: 'ModalInstanceCtrl',
            size: size,
            resolve: {
                patientInfo: function () {
                    return $scope.fields;
                },
                createTracker: function () {
                    return $scope.trackId;
                },
                appointment: function () {
                    return '';
                },
                blockInfo: function () {
                    return $scope.blockFields;
                }
            }
        });
    };

    /* function to retrieve appointment types */
    $scope.getAppointmentType = function () {
        $scope.listOfSideTabs = [];
        var url = '/Clearvision/_api/DoctorCalendarSideTab/';

        $http.get(url)
            .success(function (listOfSideTabs) {
                angular.forEach(listOfSideTabs, function (tab) {
                    $scope.listOfSideTabs.push(tab);
                });
            })
    };

    /* function to display suggested time slots */
    $scope.displaySuggestedSlots = function () {
        $scope.form.suggestedSlotList = true;
    };

    $scope.hideSuggestedSlots = function () {
        $scope.form.suggestedSlotList = false;
    };


});


/*******************************************************************************
 controller for modal instance
 *******************************************************************************/


appCalendar.controller('ModalInstanceCtrl',
    function ($scope, $http, $modalInstance, $log, $filter, patientInfo, createTracker, appointment, postAppointmentSvc,
              disableIScheduleSvc, deleteAppointmentSvc, updateAppointmentSvc, eventClickSvc, blockInfo, clearFormSvc,
              populateBlockedFormSvc, showNotificationsSvc) {

        $scope.patientDetails = patientInfo;

        $scope.trackerId = createTracker;

        $scope.appointment = appointment;

        $scope.blockDetails = blockInfo;

        $scope.createAppointment = function () {
            postAppointmentSvc.postAppointment();
            //disableIScheduleSvc.disableISchedule();
            $modalInstance.close();
        };

        $scope.deleteAppointment = function () {
            deleteAppointmentSvc.deleteAppointment($scope.selectedReason.id);
            $modalInstance.close();
        };

        $scope.updateAppointment = function () {
            updateAppointmentSvc.updateAppointment();
            $modalInstance.close();
        };

        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };

        /* function to receive cancellation reasons */
        $scope.retrieveCancellationReasons = function () {
            $http.get('/Clearvision/_api/ViewCancellationReasons/')
                .success(function (data) {
                    $scope.cancellationReasons = data;
                })
        };

        $scope.activateModalButtons = function () {
            $scope.showModalButtons = true;
        };

        /* function to populate date time fields even thought heat map is blocked */
        $scope.populateDateTimeFields = function (appointment) {
            eventClickSvc.populateDateTimeFields(appointment);
            $scope.cancel();
        };

        /* function to post block time slot */
        $scope.postBlockTimeSlots = function (doctorId, startDate, startTime, endDate, endTime, remarks) {

            if (remarks == undefined) {
                remarks = "";
            }

            var postObj = {
                "remarks": remarks,
                "startDate": startDate,
                "startTime": startTime,
                "endDate": endDate,
                "endTime": endTime,
                "doctor": doctorId
            };

            $http.post('/Clearvision/_api/CalendarBlocker/', postObj)
                .success(function (data) {
                    showNotificationsSvc.notifySuccessTemplate('Time slot blocked successfully');
                    clearFormSvc.clearBlockForm();
                })
                .error(function (data) {
                    showNotificationsSvc.notifyErrorTemplate('Error blocking time slot');
                });

            $scope.cancel();
        };

        /* function to get a list of blocked appointments */
        $scope.getListOfBlockedAppointments = function () {
            $http.get('/Clearvision/_api/CalendarBlocker/?doctor=all')
                .success(function (data) {

                    $scope.listOfBlockedAppointments = data;

                    angular.forEach($scope.listOfBlockedAppointments, function (blockedAppt) {

                        blockedAppt.start = blockedAppt.start.replace('T', ', ');
                        blockedAppt.end = blockedAppt.end.replace('T', ', ');
                    });

                });
        };

        /* function to populate block form */
        $scope.populateBlockForm = function (blockedAppt) {
            populateBlockedFormSvc.populateBlockForm(blockedAppt);
            $scope.cancel();
        };

        /* function to update blocked time slots */
        $scope.updateBlockedTimeSlots = function () {

            if ($scope.blockDetails.remarks == undefined) {
                $scope.blockDetails.remarks = "";
            }

            var updateJson = {
                "remarks": $scope.blockDetails.remarks,
                "startDate": $filter('date')($scope.blockDetails.blockDateStart, 'yyyy-MM-dd'),
                "startTime": $scope.blockDetails.blockTimeStart,
                "endDate": $filter('date')($scope.blockDetails.blockDateEnd, 'yyyy-MM-dd'),
                "endTime": $scope.blockDetails.blockTimeEnd,
                "doctor": $scope.blockDetails.doctorToBlock.id
            };

            var req = {
                method: 'PATCH',
                url: '/Clearvision/_api/CalendarBlocker/' + $scope.blockDetails.blockFormId,
                headers: {'Content-Type': 'application/json'},
                data: updateJson
            };

            $http(req)
                .success(function (data) {
                    showNotificationsSvc.notifySuccessTemplate('Time slot updated successfully');
                    clearFormSvc.clearBlockForm();
                })
                .error(function (data) {
                    showNotificationsSvc.notifyErrorTemplate('Error updating time slot');
                });

            $scope.cancel();

        };


        /* function to delete block time slot */
        $scope.deleteBlockTimeSlots = function () {

            $http.delete('/Clearvision/_api/CalendarBlocker/' + $scope.blockDetails.blockFormId)
                .success(function (data) {
                    showNotificationsSvc.notifySuccessTemplate('Time slot deleted successfully');
                    clearFormSvc.clearBlockForm();
                })
                .error(function (data) {
                    showNotificationsSvc.notifyErrorTemplate('Error deleting time slot');
                });

            $scope.cancel();
        };

    });
