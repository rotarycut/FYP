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

        self.eventClick = function (appointment, isNoShowReschedule, noShowPatientId) {

            // check if iSchedule is already enabled
            if (!self.scope.iSchedule) {

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

                var idx = 0;
                var apptTypeIndex = 0;
                angular.forEach(self.scope.listOfAppointmentTypes, function (apptType) {
                    if (apptType.name == appointment.apptType) {
                        apptTypeIndex = idx;
                    }
                    idx++;
                });

                //var appointmentId = self.scope.convertAppointmentNameToId(appointment.apptType);
                self.scope.fields.appointmentType = self.scope.listOfAppointmentTypes[apptTypeIndex];
                self.scope.fields.appointmentDate = new Date(appointment.date);

                // find the doctor assigned to the appointment
                var index = 0;
                var doctorIndex = 0;
                angular.forEach(self.scope.listOfDoctors, function (doctor) {
                    if (doctor.id == appointment.doctor.id) {
                        doctorIndex = index;
                    }
                    index++;
                });
                self.scope.fields.doctorAssigned = self.scope.listOfDoctors[doctorIndex];

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
                self.scope.fields.originalAppointmentDate = new Date(appointment.date);
                self.scope.fields.originalAppointmentTime = appointmentTime;
                self.scope.fields.originalAppointmentDoctor = appointment.doctor.name;

                // set variable of appointment timings
                self.scope.getAppointmentTimings(appointmentTime);

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
                        var patientIndex = 0;

                        // loop through the patient list and find the selected patient object
                        angular.forEach(self.scope.fields.patientList, function (patient) {
                            if (noShowPatientId === patient.id) {
                                patientIndex = indexOfPatient;
                            }
                            indexOfPatient++;
                        });

                        $timeout(function () {
                            self.scope.fields.selectedPatient = appointment.patients[patientIndex];
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

                            // additional check to make sure appointment end time isblocked too
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
            self.scope.fields.appointmentDate = new Date(appointment.date);

            var appointmentFullDateTime = appointment.start._i;
            var spaceIndex = appointmentFullDateTime.lastIndexOf(" ") + 1;
            var colonIndex = appointmentFullDateTime.lastIndexOf(":");
            var appointmentTime = appointmentFullDateTime.substring(spaceIndex, colonIndex);

            // populate the time field on selection of other heat map date time
            self.scope.getAppointmentTimings(appointmentTime);
        }

    });