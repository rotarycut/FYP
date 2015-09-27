angular.module('event.click', [])
    .service('eventClickSvc', function (clearFormSvc, $timeout) {

        var self = this;
        self.scope = {};

        self.getScope = function (scope) {
            self.scope = scope;
        };


        /*******************************************************************************
         function on event click
         *******************************************************************************/


        self.eventClick = function (appointment, isNoShowReschedule) {

            // check if iSchedule is already enabled
            if (!self.scope.iSchedule) {

                // record edit / delete timing
                self.scope.recordUpdateDeleteTimeIn('Sherman');

                // iSchedule is not previously enabled

                // check if it is coming from no show reschedule
                if (isNoShowReschedule) {
                    self.scope.isNoShowReschedule = true;
                } else {
                    self.scope.isNoShowReschedule = false;
                }

                // clear the appointment form
                clearFormSvc.clearForm();

                // set variable fields to form
                self.scope.fields.appointmentId = appointment.id;
                self.scope.fields.patientList = appointment.patients;
                self.scope.fields.appointmentType = appointment.apptType;
                self.scope.fields.appointmentDate = appointment.date;

                // set doctor assigned
                if (appointment.doctor === 1) {
                    self.scope.fields.doctorAssigned = "Dr Goh";
                } else if (appointment.doctor === 2) {
                    self.scope.fields.doctorAssigned = "Dr Ho";
                }

                try {
                    var appointmentFullDateTime = appointment._start._i;
                } catch (Exception) {
                    appointmentFullDateTime = appointment.start;
                }

                var spaceIndex = appointmentFullDateTime.lastIndexOf(" ") + 1;
                var colonIndex = appointmentFullDateTime.lastIndexOf(":");
                var appointmentTime = appointmentFullDateTime.substring(spaceIndex, colonIndex);

                // set variables of original form fields
                self.scope.fields.originalAppointmentType = appointment.apptType;
                self.scope.fields.originalAppointmentDate = appointment.date;
                self.scope.fields.originalAppointmentTime = appointmentTime;

                // set variable of appointment timings
                self.scope.getAppointmentTimings(appointmentTime);

                // navigate to calendar date
                //$('#drHoCalendar').fullCalendar('gotoDate', appointment.date);
                //$('#drHoCalendar').fullCalendar('select', appointment.date);

                // check if the selected appointment has more than one patient
                if (self.scope.fields.patientList.length === 1) {

                    // selected appointment has only one patient
                    self.scope.showForm('EditOnePatient');

                    $timeout(function () {
                        self.scope.fields.selectedPatient = appointment.patients[0];
                        self.scope.populatePatientDetails();
                    }, 1000);

                } else {

                    // selected appointment has more than one patient
                    self.scope.showForm('Edit');
                }

            } else {

                // iSchedule is already enabled

                // populate the date field on selection of other heat map date time
                self.scope.fields.appointmentDate = appointment.date;

                var appointmentFullDateTime = appointment.start._i;
                var spaceIndex = appointmentFullDateTime.lastIndexOf(" ") + 1;
                var colonIndex = appointmentFullDateTime.lastIndexOf(":");
                var appointmentTime = appointmentFullDateTime.substring(spaceIndex, colonIndex);

                // populate the time field on selection of other heat map date time
                self.scope.getAppointmentTimings(appointmentTime);
            }

        };

    });