angular.module('change.calendar', [])
    .service('changeCalendarSvc', function ($timeout, appointmentService) {

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
                        self.scope.tabs[2].active = false
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

                // remove current selected doctor appointment source and splice all the appointments
                self.scope.removeFromDoctorSource(
                    self.scope.chosenDoctor.doctorAppointmentSource,
                    self.scope.chosenDoctor.appointmentTypeSourceArray,
                    true
                );

                // de-activate current calendar tag
                self.scope.tabs[self.scope.chosenDoctor.calendarTag].active = false;

                // change chosen doctor
                self.scope.chosenDoctor = self.scope.allDoctorsVariables[calendarNumber];

                // activate the newly selected calendar tag
                self.scope.tabs[self.scope.chosenDoctor.calendarTag].active = true;

                // get newly selected doctor appointments and add them into the source
                self.scope.getDoctorAppointments(
                    self.scope.chosenDoctor.doctorName,
                    self.scope.chosenDoctor.appointmentTypeArray,
                    self.scope.chosenDoctor.doctorAppointmentSource,
                    self.scope.chosenDoctor.appointmentTypeSourceArray
                );

                //change legend for dr ho calendar
                //self.scope.showDoctorLegend = true;
                //self.scope.showOptomLegend = false;
                //self.scope.changeSelectedDoctor(self.scope.doctorGohAppointments, '', self.scope.drGohPreEvaluations, self.scope.drGohSurgeries, '', self.scope.drGohPostSurgeries);

            }

        };


        /*******************************************************************************
         function to set current selected dr scope
         *******************************************************************************/


        self.changeSelectedDoctor = function (drSourceArray, drScreenings, drPreEval, drSurgery, drEyeCare, drPostSurgery) {

            self.scope.selectedDoctor = {
                //need to have eg: drHoCalendar
                drAppointmentArray: drSourceArray,
                drScreening: drScreenings,
                drPreEval: drPreEval,
                drSurgery: drSurgery,
                drEyeCare: drEyeCare,
                drPostSurgery: drPostSurgery
            };

        };

    });