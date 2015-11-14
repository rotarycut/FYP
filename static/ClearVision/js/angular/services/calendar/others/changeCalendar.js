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

            // check if the clicking on the calendar tab is when the appointment form is shown / tabs are disabled
            if (tabDisabled) {

                // appointment form is shown, tabs are disabled

                // should not be doing anything when clicking on the calendar tabs now

                // de-activate current doctor calendar
                self.scope.chosenDoctor.active = false;

                // remove appointments from doctor source
                self.scope.removeFromDoctorSource(
                    self.scope.chosenDoctor.doctorAppointmentSource,
                    self.scope.chosenDoctor.appointmentTypeSourceArray,
                    true
                );

                // change chosen doctor
                var calendarNumber = self.scope.fields.doctorAssigned.id - 1;
                self.scope.chosenDoctor = self.scope.allDoctorsVariables[calendarNumber];

                // activate new doctor calendar
                self.scope.chosenDoctor.active = true;

                // enable iSchedule
                $timeout(function () {
                    self.scope.enableISchedule();
                }, 0);


            } else {

                // appointment form is hidden, tabs are enabled

                // get date of old appointment calendar
                var oldDoctorCalendar = '#' + self.scope.chosenDoctor.calendar;
                var date = $(oldDoctorCalendar).fullCalendar('getDate')._d;

                // change chosen doctor
                self.scope.chosenDoctor = self.scope.allDoctorsVariables[calendarNumber];

                // tag date of old calendar to newly selected calendar
                var newDoctorCalendar = '#' + self.scope.allDoctorsVariables[calendarNumber].calendar;
                $(newDoctorCalendar).fullCalendar('gotoDate', date);

                // tag view of old calendar to newly selected calendar
                self.scope.changeView(self.scope.currentView, self.scope.allDoctorsVariables[calendarNumber].changeCalendar);

                //change legend for dr ho calendar
                //self.scope.showDoctorLegend = true;
                //self.scope.showOptomLegend = false;
                //self.scope.changeSelectedDoctor(self.scope.doctorGohAppointments, '', self.scope.drGohPreEvaluations, self.scope.drGohSurgeries, '', self.scope.drGohPostSurgeries);

            }

        };

    });