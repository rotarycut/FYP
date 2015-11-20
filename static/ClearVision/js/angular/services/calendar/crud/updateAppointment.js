angular.module('update.appointment', [])
    .service('updateAppointmentSvc', function ($http, $log, $location, $rootScope, $filter, hideFormSvc,
                                               showNotificationsSvc) {

        var self = this;
        self.scope = {};

        self.getScope = function (scope) {
            self.scope = scope;
        };

        /*******************************************************************************
         function to update appointment
         *******************************************************************************/

        self.updateAppointment = function () {

            $rootScope.spinner = {active: true};

            if (self.scope.fields.appointmentRemarks === undefined) {
                self.scope.fields.appointmentRemarks = "";
            }

            if (self.scope.fields.smsOptOut === undefined) {
                self.scope.fields.smsOptOut = false;
            }

            var updateJson = {
                "id": self.scope.fields.patientId,
                "replacementApptDate": $filter('dateFilter')(self.scope.fields.appointmentDate, 'shortDate'),
                "replacementApptTime": self.scope.fields.appointmentTime,
                "type": self.scope.fields.appointmentType.name,
                "docID": self.scope.fields.doctorAssigned.id,
                "clinicID": 1,
                "remarks": self.scope.fields.appointmentRemarks,
                "patientName": self.scope.fields.patientName,
                "patientContact": self.scope.fields.patientContact,
                "socketId": self.scope.socketId,
                "smsOptOut": self.scope.fields.smsOptOut
            };

            var req = {
                method: 'PATCH',
                url: '/Clearvision/_api/appointmentsCUD/' + self.scope.fields.appointmentId,
                headers: {'Content-Type': 'application/json'},
                data: updateJson
            };

            $http(req)
                .success(function (appointment) {

                    $rootScope.spinner = {active: false};

                    showNotificationsSvc.notifySuccessTemplate('Appointment updated successfully');

                    // hide the appointment form & disables iSchedule
                    hideFormSvc.hideForm();

                    // change view back to month view, this will retrieve the doctor appointments
                    self.scope.changeView('month', self.scope.chosenDoctor.changeCalendar);

                    // if the update is coming from the no show reschedule action
                    if (self.scope.isNoShowReschedule == true) {
                        $location.path('/queue');
                    }

                    // handle the update of the newly changed appointment

                    // check the appointment type of the newly changed appointment
                    /*switch (self.scope.fields.appointmentType) {

                     case "Screening":

                     // remove the entire newly changed appointment from the calendar
                     self.scope.spliceAppointment(self.scope.selectedDoctor.drScreening.events, data.id);

                     // add the updated newly changed appointment to the calendar
                     self.scope.selectedDoctor.drScreening.events.push(data);
                     break;

                     case "Pre Evaluation":

                     self.scope.spliceAppointment(self.scope.selectedDoctor.drPreEval.events, data.id);
                     self.scope.selectedDoctor.drPreEval.events.push(data);
                     break;

                     case "Surgery":

                     self.scope.spliceAppointment(self.scope.selectedDoctor.drSurgery.events, data.id);
                     self.scope.selectedDoctor.drSurgery.events.push(data);
                     break;
                     }

                     // handle the update of the old appointment
                     var id = self.scope.fields.appointmentId;

                     // check the appointment type of the old appointment
                     switch (self.scope.fields.originalAppointmentType) {

                     case "Screening":

                     // remove the entire old appointment from the calendar
                     self.scope.spliceAppointment(self.scope.selectedDoctor.drScreening.events, id);

                     // check if the appointment still has patients after shifting a patient out
                     $http.get('/Clearvision/_api/appointments/' + id)
                     .success(function (oldAppointment) {

                     // there are still patients, add the updated old appointment back to the calendar
                     self.scope.selectedDoctor.drScreening.events.push(oldAppointment);
                     });

                     break;

                     case "Pre Evaluation":

                     self.scope.spliceAppointment(self.scope.selectedDoctor.drPreEval.events, id);

                     $http.get('/Clearvision/_api/appointments/' + id)
                     .success(function (oldAppointment) {
                     self.scope.selectedDoctor.drPreEval.events.push(oldAppointment);
                     });
                     break;

                     case "Surgery":

                     self.scope.spliceAppointment(self.scope.selectedDoctor.drSurgery.events, id);

                     $http.get('/Clearvision/_api/appointments/' + id)
                     .success(function (oldAppointment) {
                     self.scope.selectedDoctor.drSurgery.events.push(oldAppointment)
                     });
                     break;
                     }

                     // hide the appointment form
                     hideFormSvc.hideForm();

                     // if the update is coming from the no show reschedule action
                     if (self.scope.isNoShowReschedule == true) {
                     $location.path('/queue');
                     }*/

                })

                .error(function (error) {

                    $rootScope.spinner = {active: false};
                    showNotificationsSvc.notifyErrorTemplate('Error updating appointment');
                    $log.error("Error updating appointment");
                });

        }

    });