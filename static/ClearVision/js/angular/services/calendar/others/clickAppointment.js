angular.module('event.click', [])
    .service('eventClickSvc', function (clearFormSvc, $timeout) {

        var self = this;
        self._scope = {};

        self.getScope = function (scope) {
            self._scope = scope;
        };

        self.eventClick = function (appointment, isNoShowReschedule) {

            if (!self._scope.iSchedule) {

                if (isNoShowReschedule) {
                    self._scope.isNoShowReschedule = true;
                } else {
                    self._scope.isNoShowReschedule = false;
                }

                clearFormSvc.clearForm();
                self._scope.alertMessage = (appointment.title + ' was clicked ');
                self._scope.fields.appointmentId = appointment.id;
                self._scope.fields.patientList = appointment.patients;
                self._scope.fields.appointmentType = appointment.apptType;
                self._scope.fields.appointmentDate = appointment.date;

                if (appointment.doctor === 1) {
                    self._scope.fields.doctorAssigned = "Dr Goh";
                } else if (appointment.doctor === 2) {
                    self._scope.fields.doctorAssigned = "Dr Ho";
                }

                self._scope.fields.originalAppointmentType = appointment.apptType;
                self._scope.fields.originalAppointmentDate = appointment.date;

                try {
                    var appointmentFullDateTime = appointment._start._i;
                } catch (Exception) {
                    appointmentFullDateTime = appointment.start;
                }

                var spaceIndex = appointmentFullDateTime.lastIndexOf(" ") + 1;
                var colonIndex = appointmentFullDateTime.lastIndexOf(":");
                var appointmentTime = appointmentFullDateTime.substring(spaceIndex, colonIndex);

                console.log(appointmentTime);
                self._scope.fields.originalAppointmentTime = appointmentTime;
                self._scope.getAppointmentTimings(self._scope.fields.appointmentType, appointmentTime, self._scope.fields.doctorAssigned);

                $('#drHoCalendar').fullCalendar('gotoDate', appointment.date);
                $('#drHoCalendar').fullCalendar('select', appointment.date);

                if (self._scope.fields.patientList.length === 1) {
                    self._scope.showForm('EditOnePatient');

                    $timeout(function () {
                        self._scope.fields.selectedPatient = appointment.patients[0];
                        self._scope.populatePatientDetails();
                    }, 1000);

                    //console.log(appointment.patients[0].name);
                } else {
                    self._scope.showForm('Edit');
                }

                /*var noOfPatients = appointment.patients.length;

                 if (noOfPatients === 1) {
                 console.log("1 patient");
                 $scope.fields.selectedPatient = appointment.patients[0].name;
                 console.log($scope.fields.selectedPatient);
                 }*/

            } else {
                self._scope.fields.appointmentDate = appointment.date;
                var appointmentFullDateTime = appointment.start._i;
                var spaceIndex = appointmentFullDateTime.lastIndexOf(" ") + 1;
                var colonIndex = appointmentFullDateTime.lastIndexOf(":");
                self._scope.fields.appointmentTime = appointmentFullDateTime.substring(spaceIndex, colonIndex);
            }

        };

    });