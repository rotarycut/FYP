angular.module('change.calendar', [])
    .service('changeCalendarSvc', function ($timeout, $filter) {

        var self = this;
        self.scope = {};

        self.getScope = function (scope) {
            self.scope = scope;
        };

        /*******************************************************************************
         function to change calendar, setting active calendar tab & setting current selected dr scope
         *******************************************************************************/

        self.changeCalendar = function (calendarNumber, tabDisabled, clickOnTab, isFromSearch) {

            // change calendar function could be called from search box, calendar tab click, form drop down

            // css changes to make all filters underlined
            self.scope.legendScreenClicked = "legend-screen-clicked";
            self.scope.legendEvalClicked = "legend-preEval-clicked";
            self.scope.legendSurgeryClicked = "legend-surgery-clicked";

            // check if the clicking on the calendar tab is when the appointment form is shown / tabs are disabled
            if (tabDisabled) {

                // appointment form is shown, tabs are disabled

                // should not be doing anything when clicking on the calendar tabs now
                if (clickOnTab) {
                    return;
                }

                // de-activate current doctor calendar
                self.scope.chosenDoctor.active = false;

                // remove appointments from doctor source
                self.scope.removeFromDoctorSource(
                    self.scope.chosenDoctor.doctorAppointmentSource,
                    self.scope.chosenDoctor.appointmentTypeSourceArray,
                    true
                );

                // new way
                var idx = 0;
                var doctorPositionInArray = 0;

                angular.forEach(self.scope.fixedListOfDoctors, function (doctor) {
                    if (doctor.id == self.scope.fields.doctorAssigned.id) {
                        doctorPositionInArray = idx;
                    }
                    idx++;
                });

                // change chosen doctor
                //var calendarNumber = self.scope.fields.doctorAssigned.id - 1;
                self.scope.chosenDoctor = self.scope.allDoctorsVariables[doctorPositionInArray];

                // activate new doctor calendar
                self.scope.chosenDoctor.active = true;

                // enable iSchedule
                $timeout(function () {
                    self.scope.enableISchedule(true);
                }, 0);


            } else {

                // appointment form is hidden, tabs are enabled

                // get date of old appointment calendar
                var oldDoctorCalendar = '#' + self.scope.chosenDoctor.calendar;
                var date = $(oldDoctorCalendar).fullCalendar('getDate')._d;
                var oldStartRange = $(oldDoctorCalendar).fullCalendar('getView').intervalStart._d;

                // change chosen doctor
                var idx = 0;

                if (isFromSearch) {

                    // de-activate current doctor calendar
                    self.scope.chosenDoctor.active = false;

                    angular.forEach(self.scope.fixedListOfDoctors, function (doctor) {
                        if (doctor.name == self.scope.searchedDoctor) {
                            calendarNumber = idx;
                        }
                        idx++;
                    });
                    self.scope.chosenDoctor = self.scope.allDoctorsVariables[calendarNumber];

                    // activate current doctor calendar
                    self.scope.chosenDoctor.active = true;

                } else {

                    // change chosen doctor
                    self.scope.chosenDoctor = self.scope.allDoctorsVariables[calendarNumber];

                    // find the new calendar doctor tag
                    var newDoctorCalendar = '#' + self.scope.allDoctorsVariables[calendarNumber].calendar;

                    // check when you switch to the new calendar, is it already previously on this date, if it is, manually refresh (do not refresh if calendar has yet to render at least once)
                    var idx = 0;

                    angular.forEach(self.scope.trackCalendarFirstRender, function (cal) {

                        if (cal.calendarName == self.scope.chosenDoctor.calendar) {

                            if (cal.isRenderedOnce) {

                                // calendar has already rendered once
                                var newDate = $(newDoctorCalendar).fullCalendar('getDate')._d;

                                // get the range of the new calendar
                                var calendarStartDate = $(newDoctorCalendar).fullCalendar('getView').intervalStart._d;
                                var calendarEndDate = $(newDoctorCalendar).fullCalendar('getView').intervalEnd._d;

                                if (date.getTime() == newDate.getTime() && calendarStartDate.getTime() == oldStartRange.getTime()) {
                                    console.log("MANUALLY TRIGGER");

                                    calendarEndDate = moment(calendarEndDate).subtract(1, 'days')._d;

                                    var filteredStartDate = $filter('date')(calendarStartDate, 'yyyy-MM-dd');
                                    var filteredEndDate = $filter('date')(calendarEndDate, 'yyyy-MM-dd');

                                    self.scope.trackCalendar(self.scope.currentView, filteredStartDate, filteredEndDate);

                                }

                            } else {
                                // do nothing
                            }
                        }

                        idx++;
                    });

                    // tag date of old calendar to newly selected calendar
                    $(newDoctorCalendar).fullCalendar('gotoDate', date);

                    // tag view of old calendar to newly selected calendar
                    self.scope.changeView(self.scope.currentView, self.scope.allDoctorsVariables[calendarNumber].changeCalendar);
                }


                //change legend for dr ho calendar
                //self.scope.showDoctorLegend = true;
                //self.scope.showOptomLegend = false;
                //self.scope.changeSelectedDoctor(self.scope.doctorGohAppointments, '', self.scope.drGohPreEvaluations, self.scope.drGohSurgeries, '', self.scope.drGohPostSurgeries);

            }

        };

    });