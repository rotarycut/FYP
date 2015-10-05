angular.module('change.calendar', [])
    .service('changeCalendarSvc', function ($timeout) {

        var self = this;
        self.scope = {};

        self.getScope = function (scope) {
            self.scope = scope;
        };


        /*******************************************************************************
         function to change calendar, setting active calendar tab & setting current selected dr scope
         *******************************************************************************/


        self.changeCalendar = function (calendarNumber, tabDisabled, doctorDropDown) {

            // change calendar function could be called from search box, calendar tab click, form drop down

            // css changes to make all filters underlined
            self.scope.legendScreenClicked = "legend-screen-clicked";
            self.scope.legendEvalClicked = "legend-preEval-clicked";
            self.scope.legendSurgeryClicked = "legend-surgery-clicked";


            // check if the the clicking on the calendar tab is when the the appointment form is shown / tabs are disabled
            if (tabDisabled) {

                // appointment form is shown, tabs are disabled

                // should not doing anything when clicking on the calendar tabs now

                // check if it is a doctor drop down selection
                if (doctorDropDown) {

                    // set global variable calendar number
                    if (self.scope.fields.doctorAssigned.name == 'Dr Ho') {
                        self.scope.selectedCalendar = 'myCalendar1';
                    } else if (self.scope.fields.doctorAssigned.name == 'Dr Goh') {
                        self.scope.selectedCalendar = 'myCalendar2';
                    } else if (self.scope.fields.doctorAssigned.name == 'Optometrist') {
                        self.scope.selectedCalendar = 'myCalendar3';
                    }

                    // check if the drop down selection is for which doctor
                    if (self.scope.selectedCalendar == "myCalendar1") {

                        // selected dr ho on drop down field
                        self.scope.tabs[0].active = true;
                        self.scope.tabs[1].active = false;
                        self.scope.tabs[2].active = false;
                        self.scope.changeSelectedDoctor(self.scope.doctorHoAppointments, '', self.scope.drHoPreEvaluations, self.scope.drHoSurgeries, '', self.scope.drHoPostSurgeries);

                    } else if (self.scope.selectedCalendar == "myCalendar2") {

                        // selected dr goh on drop down field
                        self.scope.tabs[0].active = false;
                        self.scope.tabs[1].active = true;
                        self.scope.tabs[2].active = false;
                        self.scope.changeSelectedDoctor(self.scope.doctorGohAppointments, '', self.scope.drGohPreEvaluations, self.scope.drGohSurgeries, '', self.scope.drGohPostSurgeries);

                    } else if (self.scope.selectedCalendar == "myCalendar3") {

                        // selected optom on drop down field
                        self.scope.tabs[0].active = false;
                        self.scope.tabs[1].active = false;
                        self.scope.tabs[2].active = true;
                        self.scope.changeSelectedDoctor(self.scope.optomAppointments, self.scope.optomScreenings, '', '', self.scope.optomEyeCare, '');

                    }

                    // enable iSchedule
                    $timeout(function () {
                        self.scope.enableISchedule();
                    }, 0);

                }

                // re render doctors calendars
                $('#drHoCalendar').fullCalendar('refetchEvents');
                $('#drGohCalendar').fullCalendar('refetchEvents');
                $('#optomCalendar').fullCalendar('refetchEvents');

            } else {

                // appointment form is hidden, tabs are enabled

                // set global variable calendar number
                self.scope.selectedCalendar = calendarNumber;

                // check if the tab click is on which doctor tab || selected search result is for which doctor appointment
                if (self.scope.selectedCalendar == "myCalendar1") {

                    //change legend for dr ho calendar
                    self.scope.showDoctorLegend = true;
                    self.scope.showOptomLegend = false;
                    // clicked on doctor ho calendar tab || selected search result of dr ho appointment
                    self.scope.tabs[0].active = true;
                    self.scope.tabs[1].active = false;
                    self.scope.tabs[2].active = false;
                    self.scope.changeSelectedDoctor(self.scope.doctorHoAppointments, '', self.scope.drHoPreEvaluations, self.scope.drHoSurgeries, '', self.scope.drHoPostSurgeries);

                } else if (self.scope.selectedCalendar == "myCalendar2") {

                    //change legend for dr goh calendar
                    self.scope.showDoctorLegend = true;
                    self.scope.showOptomLegend = false;

                    // clicked on doctor goh calendar tab || selected search result of dr goh appointment
                    self.scope.tabs[0].active = false;
                    self.scope.tabs[1].active = true;
                    self.scope.tabs[2].active = false;
                    self.scope.changeSelectedDoctor(self.scope.doctorGohAppointments, '', self.scope.drGohPreEvaluations, self.scope.drGohSurgeries, '', self.scope.drGohPostSurgeries);

                } else if (self.scope.selectedCalendar == "myCalendar3") {

                    //change legend for optom calendar
                    self.scope.showDoctorLegend = false;
                    self.scope.showOptomLegend = true;

                    // clicked on optom calendar tab || selected search result of dr goh appointment
                    self.scope.tabs[0].active = false;
                    self.scope.tabs[1].active = false;
                    self.scope.tabs[2].active = true;
                    self.scope.changeSelectedDoctor(self.scope.optomAppointments, self.scope.optomScreenings, '', '', self.scope.optomEyeCare, '');
                }

                // re render doctors calendars
                $('#drHoCalendar').fullCalendar('refetchEvents');
                $('#drGohCalendar').fullCalendar('refetchEvents');
                $('#optomCalendar').fullCalendar('refetchEvents');

            }

        };


        /*******************************************************************************
         function to set current selected dr scope
         *******************************************************************************/


        self.changeSelectedDoctor = function (drSourceArray, drScreenings, drPreEval, drSurgery, drEyeCare, drPostSurgery) {

            self.scope.selectedDoctor = {
                drAppointmentArray: drSourceArray,
                drScreening: drScreenings,
                drPreEval: drPreEval,
                drSurgery: drSurgery,
                drEyeCare: drEyeCare,
                drPostSurgery: drPostSurgery
            };

        };


    });