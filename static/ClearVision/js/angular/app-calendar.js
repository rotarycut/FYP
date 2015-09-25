var appCalendar = angular.module('app.calendar', ['ngProgress']);


appCalendar.controller('CalendarCtrl', function ($scope, $compile, uiCalendarConfig, $timeout, $http,
                                                 appointmentService, ngProgressFactory, $modal,
                                                 postAppointmentSvc, clearFormSvc, enableIScheduleSvc, disableIScheduleSvc,
                                                 deleteAppointmentSvc, updateAppointmentSvc, hideFormSvc, eventClickSvc,
                                                 filterAppointmentSvc, $interval, $dragon, populatePatientsSvc, $log,
                                                 getApptTimingsSvc, showFormSvc, searchAppointmentsSvc, checkExistingPatientSvc) {

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

    /* pass the scope to the post appointment service upon initialization */
    postAppointmentSvc.getScope($scope);
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

    /* --- start of declaration of event source that contains custom events on the scope --- */
    $scope.drHoScreenings = {
        color: '#E7A83E',
        textColor: 'White',
        events: []
    };

    $scope.drHoPreEvaluations = {
        color: '#FFA480',
        textColor: 'White',
        events: []
    };

    $scope.drHoSurgeries = {
        color: '#EA525F',
        textColor: 'White',
        events: []
    };

    $scope.drGohScreenings = {
        color: '#E7A83E',
        textColor: 'White',
        events: []
    };

    $scope.drGohPreEvaluations = {
        color: '#FFA480',
        textColor: 'White',
        events: []
    };

    $scope.drGohSurgeries = {
        color: '#EA525F',
        textColor: 'White',
        events: []
    };

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

    /* event sources array */
    $scope.doctorHoAppointments = [];
    $scope.doctorGohAppointments = [];

    $scope.selectedDoctor = {
        drAppointmentArray: $scope.doctorHoAppointments,
        drScreening: $scope.drHoScreenings,
        drPreEval: $scope.drHoPreEvaluations,
        drSurgery: $scope.drHoSurgeries
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

    /* function to get heat map */
    $scope.getHeatMap = function (appointmentType, doctorName) {

        var lowHeatUrl = '/Clearvision/_api/HeatMap/?monthsAhead=2&timeslotType=' + appointmentType + '&upperB=1&lowerB=0&docName=' + doctorName;
        var medHeatUrl = '/Clearvision/_api/HeatMap/?monthsAhead=2&timeslotType=' + appointmentType + '&upperB=3&lowerB=2&docName=' + doctorName;
        var highHeatUrl = '/Clearvision/_api/HeatMap/?monthsAhead=2&timeslotType=' + appointmentType + '&upperB=15&lowerB=4&docName=' + doctorName;

        $http.get(lowHeatUrl)
            .success(function (listOfAppointments) {
                var count = 0;
                angular.forEach(listOfAppointments, function (appointment) {
                    //appointment.title = appointment.patientcount + " patient(s)";
                    if (count <= 351) {
                        //$scope.drGohLowHeatMap.events.push(appointment);
                        $scope.tempLowHeatMap.events.push(appointment);

                        count++;
                    } else {
                        //return;
                    }

                });

                $scope.addEventSource($scope.selectedDoctor.drAppointmentArray, $scope.tempLowHeatMap);
            });

        $http.get(medHeatUrl)
            .success(function (listOfAppointments) {
                var count = 0;
                angular.forEach(listOfAppointments, function (appointment) {
                    //appointment.title = appointment.patientcount + " patient(s)";
                    if (count <= 351) {
                        //$scope.drHoMedHeatMap.events.push(appointment);
                        //$scope.drGohMedHeatMap.events.push(appointment);
                        $scope.tempMedHeatMap.events.push(appointment);

                        count++;
                    } else {
                        //return;
                    }
                });

                $scope.addEventSource($scope.selectedDoctor.drAppointmentArray, $scope.tempMedHeatMap);
            });

        $http.get(highHeatUrl)
            .success(function (listOfAppointments) {
                var count = 0;
                angular.forEach(listOfAppointments, function (appointment) {
                    //appointment.title = appointment.patientcount + " patient(s)";
                    if (count <= 351) {
                        //$scope.drHoHighHeatMap.events.push(appointment);
                        //$scope.drGohHighHeatMap.events.push(appointment);
                        $scope.tempHighHeatMap.events.push(appointment);

                        count++;
                    } else {
                        //return;
                    }
                });

                $scope.addEventSource($scope.selectedDoctor.drAppointmentArray, $scope.tempHighHeatMap);
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
            eventRender: $scope.eventRender
        }
    };


    /*******************************************************************************
     function to add doctors' appointment sources
     *******************************************************************************/


    $scope.addRemoveDrGohSources = function () {
        $scope.addRemoveEventSource($scope.doctorGohAppointments, $scope.drGohScreenings);
        $scope.addRemoveEventSource($scope.doctorGohAppointments, $scope.drGohPreEvaluations);
        $scope.addRemoveEventSource($scope.doctorGohAppointments, $scope.drGohSurgeries);
    };

    $scope.addRemoveDrHoSources = function () {
        $scope.addRemoveEventSource($scope.doctorHoAppointments, $scope.drHoScreenings);
        $scope.addRemoveEventSource($scope.doctorHoAppointments, $scope.drHoPreEvaluations);
        $scope.addRemoveEventSource($scope.doctorHoAppointments, $scope.drHoSurgeries);
    };


    /*******************************************************************************
     function to retrieve doctors' appointments
     *******************************************************************************/


    /* function to retrieve doctor ho's appointments */
    $scope.getDrHoAppointments = function () {

        appointmentService.getDrHoAppointments()
            .then(function (appointmentType) {

                angular.forEach(appointmentType[0], function (screening) {
                    $scope.drHoScreenings.events.push(screening);
                });

                angular.forEach(appointmentType[1], function (preEval) {
                    $scope.drHoPreEvaluations.events.push(preEval);
                });

                angular.forEach(appointmentType[2], function (surgery) {
                    $scope.drHoSurgeries.events.push(surgery);
                });

                $scope.addRemoveDrHoSources();

            },
            function (data) {
                console.log("Failed to retrieve dr ho appointments");
            });
    };

    /* function to retrieve doctor goh's appointments */
    $scope.getDrGohAppointments = function () {

        appointmentService.getDrGohAppointments()
            .then(function (appointmentType) {

                angular.forEach(appointmentType[0], function (screening) {
                    $scope.drGohScreenings.events.push(screening);
                });

                angular.forEach(appointmentType[1], function (preEval) {
                    $scope.drGohPreEvaluations.events.push(preEval);
                });

                angular.forEach(appointmentType[2], function (surgery) {
                    $scope.drGohSurgeries.events.push(surgery);
                });

                $scope.addRemoveDrGohSources();

            },
            function (data) {
                console.log("Failed to retrieve dr goh appointments");
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


    /*******************************************************************************
     initialization when page first loads
     *******************************************************************************/


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
    $scope.screenIconChange = "fa fa-check-square";
    $scope.preEvalIconChange = "fa fa-check-square";
    $scope.surgeryIconChange = "fa fa-check-square";

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
            //patientName: false,
            //contact: false,
            doctor: false,
            marketingChannel: false
        },
        showButtons: {
            createForm: false,
            editForm: false,
            addAndBlock: true
        }
    };

    $scope.disableSearchBox = false;
    /* different lists to populate form. will subsequently get from backend */
    $scope.listOfAppointmentTypes = ["Screening", "Pre Evaluation", "Surgery"];
    //$scope.listOfAppointmentTimings = ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00"];
    $scope.listOfMarketingChannels = ["987 Radio", "Andrea Chong Blog", "Channel News Asia", "Referred by Doctor", "ST Ads", "Others"];
    $scope.listOfDoctors = ["Dr Ho", "Dr Goh"];
    $scope.selectedCalendar = "myCalendar1";
    $scope.drHoCalendar = true;
    $scope.drGohCalendar = false;

    /* function to show appointment form */
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

    /* function to clear form */
    $scope.clearForm = function () {
        clearFormSvc.clearForm();
        //disableIScheduleSvc.disableISchedule();
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


    /*******************************************************************************
     function to change calendar
     *******************************************************************************/


    $scope.changeCalendar = function (calendarNumber, tabDisabled, doctorDropDown) {

        // change calendar function could be called from search box, calendar tab click, form drop down

        // css changes to make all filters underlined
        $scope.legendScreenClicked = "legend-screen-clicked";
        $scope.legendEvalClicked = "legend-preEval-clicked";
        $scope.legendSurgeryClicked = "legend-surgery-clicked";


        // check if the the clicking on the calendar tab is when the the appointment form is shown / tabs are disabled
        if (tabDisabled) {

            // appointment form is shown, tabs are disabled

            // should not doing anything when clicking on the calendar tabs now

            // check if it is a doctor drop down selection
            if (doctorDropDown) {

                // set global variable calendar number
                if ($scope.fields.doctorAssigned == 'Dr Ho') {
                    $scope.selectedCalendar = 'myCalendar1';
                } else {
                    $scope.selectedCalendar = 'myCalendar2';
                }

                // check if the drop down selection is for which doctor
                if ($scope.selectedCalendar == "myCalendar1") {

                    // selected dr ho on drop down field
                    $scope.tabs[1].active = false;
                    $scope.tabs[0].active = true;
                    $scope.changeSelectedDoctor($scope.doctorHoAppointments, $scope.drHoScreenings, $scope.drHoPreEvaluations, $scope.drHoSurgeries);

                } else {

                    // selected dr goh on drop down field
                    $scope.tabs[0].active = false;
                    $scope.tabs[1].active = true;
                    $scope.changeSelectedDoctor($scope.doctorGohAppointments, $scope.drGohScreenings, $scope.drGohPreEvaluations, $scope.drGohSurgeries);
                }

                // enable iSchedule
                $timeout(function () {
                    $scope.enableISchedule();
                }, 500);

            }

        } else {

            // appointment form is hidden, tabs are enabled

            // set global variable calendar number
            $scope.selectedCalendar = calendarNumber;

            // check if the tab click is on which doctor tab || selected search result is for which doctor appointment
            if ($scope.selectedCalendar == "myCalendar1") {

                // clicked on doctor ho calendar tab || selected search result of dr ho appointment
                $scope.tabs[1].active = false;
                $scope.tabs[0].active = true;
                $scope.changeSelectedDoctor($scope.doctorHoAppointments, $scope.drHoScreenings, $scope.drHoPreEvaluations, $scope.drHoSurgeries);

            } else {

                // clicked on doctor goh calendar tab || selected search result of dr goh appointment
                $scope.tabs[0].active = false;
                $scope.tabs[1].active = true;
                $scope.changeSelectedDoctor($scope.doctorGohAppointments, $scope.drGohScreenings, $scope.drGohPreEvaluations, $scope.drGohSurgeries);
            }

        }
    };

    /* function to change selected doctor */
    $scope.changeSelectedDoctor = function (drSourceArray, drScreenings, drPreEval, drSurgery) {

        $scope.selectedDoctor = {
            drAppointmentArray: drSourceArray,
            drScreening: drScreenings,
            drPreEval: drPreEval,
            drSurgery: drSurgery
        };
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


    /*******************************************************************************
     on select of patient after keying in contact no
     *******************************************************************************/


    $scope.selectPatient = function ($item, $model, $label, appt) {

        $scope.fields.patientContact = $item.contact;
        $scope.fields.patientName = $item.name;
        $scope.fields.marketingChannel = $item.marketingname;

        // disable marketing channel field on select of patient
        $scope.form.disableFields.marketingChannel = true;
    };


    /*******************************************************************************
     function after selecting an appointment from the search box result
     *******************************************************************************/


    $scope.onSelect = function ($item, $model, $label) {

        // discover which doctor appointment is selected
        var doctorIndex = $item.indexOf("Dr");
        var lastCommar = $item.lastIndexOf(",");
        var doctor = $item.substring(doctorIndex, lastCommar);

        // discover appointment date
        var commarIndex = $item.indexOf(",");
        var date = $item.substring(0, commarIndex);


        // check if the selected appointment is dr ho or dr goh appointment
        if (doctor == "Dr Ho") {

            // change the calendar view to the day view
            $scope.changeView('agendaDay', 'myCalendar1');

            // navigate the calendar to the appointment date
            $('#drHoCalendar').fullCalendar('gotoDate', date);

            // change the calendar tab and set variables, doesnt matter if it is edit >1 patients and showing patient list since giving default false
            $scope.changeCalendar('myCalendar1', false);

        } else if (doctor == "Dr Goh") {

            $scope.changeView('agendaDay', 'myCalendar2');
            $('#drGohCalendar').fullCalendar('gotoDate', date);
            $scope.changeCalendar('myCalendar2', false);

            //$scope.changeCalendar('', false);
        }

        // clear the search box text
        $scope.searchText = "";
    };


    /*******************************************************************************
     initialize calendar doctor tabs
     *******************************************************************************/


    $scope.tabs = [
        {
            title: 'Dr. Ho',
            calendar: 'drHoCalendar',
            initialise: 'Dr Ho',
            changeCalendar: 'myCalendar1',
            active: true,
            disable: false,
            model: $scope.doctorHoAppointments
        },
        {
            title: 'Dr. Goh',
            calendar: 'drGohCalendar',
            initialise: 'Dr Goh',
            changeCalendar: 'myCalendar2',
            active: false,
            disable: false,
            model: $scope.doctorGohAppointments
        }
    ];


    /*******************************************************************************
     initialize calendar appointments
     *******************************************************************************/


    $scope.initializeAppointments = function () {
        $scope.getDrHoAppointments();
        $scope.getDrGohAppointments();
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

        console.log(selectedHour);
        console.log(selectedMinute);

    };


    /*******************************************************************************
     tracking of user action timings
     *******************************************************************************/


    /* start recording create appointment */
    $scope.recordCreationTimeIn = function (userName) {

        var date = new Date();
        var time = date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();

        var req =
        {
            "user": userName,
            "action": "Create Appt",
            "timeIn": time
        };

        $http.post('/Clearvision/_api/UserTrackingTimeIn', req)
            .success(function (data) {
                //console.log(data);
                $log.info("Start recording of creating appointment..");
                $scope.trackId = data;
            });

    };

    /* start recording update appointment */
    $scope.recordUpdateTimeIn = function (userName) {

        var date = new Date();
        var time = date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();

        var req =
        {
            "user": userName,
            "action": "",
            "timeIn": time
        };

        $http.post('/Clearvision/_api/UserTrackingTimeIn', req)
            .success(function (data) {
                //console.log(data);
                $log.info("Start recording of editing / deleting appointment..");
                $scope.trackId = data;
            });

    };

    $scope.trackId = "";


    /*******************************************************************************
     socket programming
     *******************************************************************************/


    $scope.channelCreate = 'createAppt';
    $scope.channelDelete = 'deleteAppt';
    $scope.channelUpdate = 'updateAppt';

    $dragon.onReady(function () {

        $dragon.subscribe('AppointmentCreate', $scope.channelCreate, null)
            .then(function (response) {
            });

        $dragon.subscribe('AppointmentDelete', $scope.channelDelete, null)
            .then(function (response) {
            });

        $dragon.subscribe('AppointmentUpdate', $scope.channelUpdate, null)
            .then(function (response) {
            });

    });

    $dragon.onChannelMessage(function (channels, message) {

        /*$timeout(function () {
         if (channels[0] === "createAppt") {
         $log.info("Receiving socket request to create appointment");
         postAppointmentSvc.postAppointment(message.data, true);
         }

         else if (channels[0] === "deleteAppt") {
         $log.info("Receiving socket request to delete appointment");
         deleteAppointmentSvc.deleteAppointment("reason", message.data, true);
         }

         else if (channels[0] === "updateAppt") {
         $log.info("Receiving socket request to update appointment");
         //updateAppointmentSvc.updateAppointment(message.data, true);
         }

         }, 5000);*/

    });


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

                    return $scope.fields;
                },
                createTracker: function () {
                    return $scope.trackId;
                }
            }
        });
    };

});


/*******************************************************************************
 controller for modal instance
 *******************************************************************************/


appCalendar.controller('ModalInstanceCtrl', function ($scope, $http, $modalInstance, $log, patientInfo, createTracker, postAppointmentSvc, disableIScheduleSvc, deleteAppointmentSvc, updateAppointmentSvc) {
    $scope.patientDetails = patientInfo;
    $scope.trackerId = createTracker;

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

    /* function to record create appointment time out */
    $scope.recordCreationTimeOut = function (userName) {

        var date = new Date();

        var time = date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();

        var req =
        {
            "timeOut": time,
            "trackerId": createTracker
        };

        $http.post('/Clearvision/_api/UserTrackingTimeOut', req)
            .success(function (data) {
                $log.info("End recording of creating appointment");
            });

    };

});