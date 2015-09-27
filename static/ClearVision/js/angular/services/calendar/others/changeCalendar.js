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
                    if (self.scope.fields.doctorAssigned == 'Dr Ho') {
                        self.scope.selectedCalendar = 'myCalendar1';
                    } else {
                        self.scope.selectedCalendar = 'myCalendar2';
                    }

                    // check if the drop down selection is for which doctor
                    if (self.scope.selectedCalendar == "myCalendar1") {

                        // selected dr ho on drop down field
                        self.scope.tabs[1].active = false;
                        self.scope.tabs[0].active = true;
                        self.scope.changeSelectedDoctor(self.scope.doctorHoAppointments, self.scope.drHoScreenings, self.scope.drHoPreEvaluations, self.scope.drHoSurgeries);

                    } else {

                        // selected dr goh on drop down field
                        self.scope.tabs[0].active = false;
                        self.scope.tabs[1].active = true;
                        self.scope.changeSelectedDoctor(self.scope.doctorGohAppointments, self.scope.drGohScreenings, self.scope.drGohPreEvaluations, self.scope.drGohSurgeries);
                    }

                    // enable iSchedule
                    $timeout(function () {
                        self.scope.enableISchedule();
                    }, 0);

                }

            } else {

                // appointment form is hidden, tabs are enabled

                // set global variable calendar number
                self.scope.selectedCalendar = calendarNumber;

                // check if the tab click is on which doctor tab || selected search result is for which doctor appointment
                if (self.scope.selectedCalendar == "myCalendar1") {

                    // clicked on doctor ho calendar tab || selected search result of dr ho appointment
                    self.scope.tabs[1].active = false;
                    self.scope.tabs[0].active = true;
                    self.scope.changeSelectedDoctor(self.scope.doctorHoAppointments, self.scope.drHoScreenings, self.scope.drHoPreEvaluations, self.scope.drHoSurgeries);

                } else {

                    // clicked on doctor goh calendar tab || selected search result of dr goh appointment
                    self.scope.tabs[0].active = false;
                    self.scope.tabs[1].active = true;
                    self.scope.changeSelectedDoctor(self.scope.doctorGohAppointments, self.scope.drGohScreenings, self.scope.drGohPreEvaluations, self.scope.drGohSurgeries);
                }

            }

        };


        /*******************************************************************************
         function to set current selected dr scope
         *******************************************************************************/


        self.changeSelectedDoctor = function (drSourceArray, drScreenings, drPreEval, drSurgery) {

            self.scope.selectedDoctor = {
                drAppointmentArray: drSourceArray,
                drScreening: drScreenings,
                drPreEval: drPreEval,
                drSurgery: drSurgery
            };

        };


    });