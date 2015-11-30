var app = angular.module('enable.ISchedule', []);

app.service('enableIScheduleSvc', function ($rootScope, suggestedAppointmentsSvc) {

    var self = this;
    self.scope = {};

    self.getScope = function (scope) {
        self.scope = scope;
    };

    /*******************************************************************************
     function to enable iSchedule
     *******************************************************************************/

    self.enableISchedule = function (fromChangeCalendar) {

        // do not enable iSchedule until both appointment type and doctor are selected
        if (self.scope.fields.appointmentType == undefined || self.scope.fields.doctorAssigned == undefined) {
            return;
        }

        // activate spinner load progress bar
        $rootScope.spinner = {active: true};

        // disable appointment type and doctor field to be changed while loading heat map & back button
        self.scope.form.disableFields.disabledApptType = true;
        self.scope.form.disableFields.doctor = true;
        self.scope.form.backBtn = true;


        if (self.scope.formTitle === 'Create New Appointment' || self.scope.formTitle === 'Edit Appointment') {

            // disable search box when iSchedule is enabled
            self.scope.disableSearchBox = true;

            // check if iSchedule is already enabled
            if (!self.scope.iSchedule) {

                // iSchedule is not previously enabled, this must be set before you change the calendar view and the track calendar method runs
                self.scope.showHeatMap = true;
                self.scope.iSchedule = true;

                // change the calendar view to week view
                self.scope.changeView('agendaWeek', self.scope.chosenDoctor.changeCalendar);

                // navigate the calendar to current date only if current view is before current date once heat map is enabled
                this.shiftIfPastDate();

                // remove appointments from doctor source, if from change calendar method, doctor would already have been removed
                if (!fromChangeCalendar) {
                    self.scope.removeFromDoctorSource(
                        self.scope.chosenDoctor.doctorAppointmentSource,
                        self.scope.chosenDoctor.appointmentTypeSourceArray,
                        true
                    );
                }

                // get heat map for chosen appointment type and doctor
                self.scope.getHeatMap(self.scope.fields.appointmentType.name, self.scope.fields.doctorAssigned.id);

                // hide the calendar legend when heat map is shown
                self.scope.showFilters = false;

                // enable suggested appointment time slots
                suggestedAppointmentsSvc.suggestAppointments();

            } else {

                // iSchedule is already enabled

                // change the calendar view to week view
                self.scope.changeView('agendaWeek', self.scope.chosenDoctor.changeCalendar);

                // navigate the calendar to current date only if current view is before current date once heat map is enabled
                this.shiftIfPastDate();

                self.scope.removeEventSource(self.scope.chosenDoctor.doctorAppointmentSource, self.scope.tempLowHeatMap);
                self.scope.removeEventSource(self.scope.chosenDoctor.doctorAppointmentSource, self.scope.tempMedHeatMap);
                self.scope.removeEventSource(self.scope.chosenDoctor.doctorAppointmentSource, self.scope.tempHighHeatMap);
                self.scope.removeEventSource(self.scope.chosenDoctor.doctorAppointmentSource, self.scope.blockedHeatMap);

                // remove all the appointments in each of the low, medium and high heat map
                self.scope.tempLowHeatMap.events.splice(0, self.scope.tempLowHeatMap.events.length);
                self.scope.tempMedHeatMap.events.splice(0, self.scope.tempMedHeatMap.events.length);
                self.scope.tempHighHeatMap.events.splice(0, self.scope.tempHighHeatMap.events.length);
                self.scope.blockedHeatMap.events.splice(0, self.scope.blockedHeatMap.events.length);


                // remove all the low, medium, high heat map from the source array
                /*self.scope.removeEventSource(self.scope.DrHoappointments, self.scope.tempLowHeatMap);
                 self.scope.removeEventSource(self.scope.DrHoappointments, self.scope.tempMedHeatMap);
                 self.scope.removeEventSource(self.scope.DrHoappointments, self.scope.tempHighHeatMap);
                 self.scope.removeEventSource(self.scope.DrHoappointments, self.scope.blockedHeatMap);
                 self.scope.removeEventSource(self.scope.DrGohappointments, self.scope.tempLowHeatMap);
                 self.scope.removeEventSource(self.scope.DrGohappointments, self.scope.tempMedHeatMap);
                 self.scope.removeEventSource(self.scope.DrGohappointments, self.scope.tempHighHeatMap);
                 self.scope.removeEventSource(self.scope.DrGohappointments, self.scope.blockedHeatMap);
                 self.scope.removeEventSource(self.scope.Optometristappointments, self.scope.tempLowHeatMap);
                 self.scope.removeEventSource(self.scope.Optometristappointments, self.scope.tempMedHeatMap);
                 self.scope.removeEventSource(self.scope.Optometristappointments, self.scope.tempHighHeatMap);
                 self.scope.removeEventSource(self.scope.Optometristappointments, self.scope.blockedHeatMap);*/

                // check if the appointment type chosen and doctor chosen is valid
                var apptTypeAndDoctorIsValid = this.checkApptTypeAndDoctorMatch(self.scope.fields.appointmentType.name);

                if (apptTypeAndDoctorIsValid) {
                    // get heat map for chosen appointment type and doctor
                    self.scope.getHeatMap(self.scope.fields.appointmentType.name, self.scope.fields.doctorAssigned.id);

                    // enable suggested appointment time slots
                    suggestedAppointmentsSvc.suggestAppointments();

                } else {
                    // clear the doctor name field
                    self.scope.fields.doctorAssigned = "";
                    $rootScope.spinner = {active: false};
                    self.scope.form.disableFields.disabledApptType = false;
                    self.scope.form.disableFields.doctor = false;
                    self.scope.form.backBtn = false;
                    self.scope.listOfSuggestedAppointments = [];
                }
            }
        }
    };

    /*******************************************************************************
     function to shift to current date if date input is earlier than current date
     *******************************************************************************/

    self.shiftIfPastDate = function () {

        var doctorCalendar = '#' + self.scope.chosenDoctor.calendar;

        var calendarEndDate = $(doctorCalendar).fullCalendar('getView').intervalEnd._d;
        calendarEndDate = moment(calendarEndDate).subtract(1, 'days')._d;

        if (calendarEndDate.getTime() <= new Date().getTime()) {

            $(doctorCalendar).fullCalendar('gotoDate', new Date());

        } else {
            // do nothing
        }

    };

    /*******************************************************************************
     function to check if the appointment type chosen and doctor chosen is valid
     *******************************************************************************/

    self.checkApptTypeAndDoctorMatch = function (appointmentTypeName) {

        var isValid = false;

        angular.forEach(self.scope.chosenDoctor.appointmentTypeArray, function (doctorAppointmentType) {

            if (doctorAppointmentType == appointmentTypeName) {
                isValid = true;
            }

        });

        return isValid;

    };

});