angular.module('event.click', [])
    .service('eventClickSvc', function (clearFormSvc, $timeout, $http) {

        var self = this;
        self.scope = {};

        self.getScope = function (scope) {
            self.scope = scope;
        };


        /*******************************************************************************
         function on event click
         *******************************************************************************/


        self.eventClick = function (appointment, isNoShowReschedule, noShowPatientName) {

            // check if iSchedule is already enabled
            if (!self.scope.iSchedule) {

                // record edit / delete timing
                self.scope.recordUpdateDeleteTimeIn('Admin');

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

                var appointmentId = self.scope.convertAppointmentNameToId(appointment.apptType);
                self.scope.fields.appointmentType = self.scope.listOfAppointmentTypes[appointmentId - 1];
                self.scope.fields.appointmentDate = appointment.date;
                self.scope.fields.doctorAssigned = self.scope.listOfDoctors[appointment.doctor.id - 1];

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

                    if (isNoShowReschedule) {

                        // always show edit form and populate when it is coming from no show list, even tho have more than one patient in appointment

                        // selected from no show list is for a unique patient
                        self.scope.showForm('EditOnePatient');

                        // index of selected patient in the drop down list
                        var indexOfPatient = 0;

                        // loop through the patient list and find the selected patient object
                        angular.forEach(self.scope.fields.patientList, function (patient) {
                            if (noShowPatientName === patient.name) {
                                indexOfPatient++;
                            }
                        });

                        $timeout(function () {
                            self.scope.fields.selectedPatient = appointment.patients[indexOfPatient];
                            self.scope.populatePatientDetails();
                        }, 1000);

                    } else {

                        // selected appointment has more than one patient
                        self.scope.showForm('Edit');
                    }

                }


            } else {

                // iSchedule is already enabled

                // check if the heat map appointment is blocked

                var appointmentDate = self.scope.getFormattedDate(appointment.start._d);
                var appointmentStartTime = self.scope.getFormattedTime(appointment.start._i);
                var appointmentEndTime = self.scope.getFormattedTime(appointment.end._i);

                $http.get('/Clearvision/_api/ViewDoctorBlockedTime/?date=' + appointmentDate + '' + appointmentStartTime + '&docID=' + self.scope.fields.doctorAssigned.id)
                    .success(function (data) {

                        if (data == false) {
                            // appointment is not blocked
                            self.populateDateTimeFields(appointment);

                        } else {

                            // additional check to make sure appointment end time is blocked too
                            $http.get('/Clearvision/_api/ViewDoctorBlockedTime/?date=' + appointmentDate + '' + appointmentEndTime + '&docID=' + self.scope.fields.doctorAssigned.id)
                                .success(function (data) {

                                    if (data == false) {
                                        // appointment is not blocked
                                        self.populateDateTimeFields(appointment);

                                    } else {
                                        // appointment is blocked
                                        self.scope.openBlockedModal('sm', appointment);
                                    }
                                });

                        }

                    });

            }

        };

        self.populateDateTimeFields = function (appointment) {

            // populate the date field on selection of other heat map date time
            self.scope.fields.appointmentDate = appointment.date;

            var appointmentFullDateTime = appointment.start._i;
            var spaceIndex = appointmentFullDateTime.lastIndexOf(" ") + 1;
            var colonIndex = appointmentFullDateTime.lastIndexOf(":");
            var appointmentTime = appointmentFullDateTime.substring(spaceIndex, colonIndex);

            // populate the time field on selection of other heat map date time
            self.scope.getAppointmentTimings(appointmentTime);
        }

    });