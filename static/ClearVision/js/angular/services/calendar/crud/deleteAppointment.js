angular.module('delete.appointment', [])
    .service('deleteAppointmentSvc', function ($http, $log, $rootScope, hideFormSvc, getNotificationsSvc,
                                               showNotificationsSvc) {

        var self = this;
        self.scope = {};

        self.getScope = function (scope) {
            self.scope = scope;
        };

        /*******************************************************************************
         function to delete appointment
         *******************************************************************************/

        self.deleteAppointment = function (reasonId) {

            $rootScope.spinner = {active: true};

            var req = {
                method: 'DELETE',
                url: '/Clearvision/_api/appointmentsCUD/' + self.scope.fields.appointmentId,
                headers: {'Content-Type': 'application/json'},
                data: {
                    "id": self.scope.fields.patientId,
                    "cancellationReasonID": reasonId,
                    "socketId": self.scope.socketId
                }
            };

            $http(req)
                .success(function (appointment) {

                    $rootScope.spinner = {active: false};

                    showNotificationsSvc.notifySuccessTemplate('Appointment deleted successfully');

                    // hide the appointment form & disables iSchedule
                    hideFormSvc.hideForm();

                    // change view back to month view, this will retrieve the doctor appointments
                    self.scope.changeView('month', self.scope.chosenDoctor.changeCalendar);


                    // find out if there will be any patients left after the deletion
                    /*var urlStr = '/Clearvision/_api/appointments/' + self.scope.fields.appointmentId;

                     $http.get(urlStr)
                     .success(function (data) {

                     // there are still patients in the appointment after the deletion
                     $log.warn("There still exist patients in the appointment");

                     // check the appointment type of the deleted appointment
                     switch (self.scope.fields.appointmentType) {

                     case "Screening":
                     var appointmentIndex = 0;

                     // loop through all the screening events of the selected doctor
                     angular.forEach(self.scope.selectedDoctor.drScreening.events, function (screeningAppointment) {

                     // find the appointment to be deleted
                     if (screeningAppointment.id === self.scope.fields.appointmentId) {

                     // remove the entire appointment from the calendar
                     self.scope.selectedDoctor.drScreening.events.splice(appointmentIndex, 1);

                     }
                     appointmentIndex++;
                     });

                     // add the updated appointment minus the deleted patient back into the calendar
                     self.scope.selectedDoctor.drScreening.events.push(data);
                     break;

                     case "Pre Evaluation":
                     var appointmentIndex = 0;

                     angular.forEach(self.scope.selectedDoctor.drPreEval.events, function (preEvaluationAppointment) {

                     if (preEvaluationAppointment.id === self.scope.fields.appointmentId) {

                     self.scope.selectedDoctor.drPreEval.events.splice(appointmentIndex, 1);

                     }
                     appointmentIndex++;
                     });

                     self.scope.selectedDoctor.drPreEval.events.push(data);
                     break;

                     case "Surgery":
                     var appointmentIndex = 0;

                     angular.forEach(self.scope.selectedDoctor.drSurgery.events, function (surgeryAppointment) {

                     if (surgeryAppointment.id === self.scope.fields.appointmentId) {

                     self.scope.selectedDoctor.drSurgery.events.splice(appointmentIndex, 1);

                     }
                     appointmentIndex++;
                     });

                     self.scope.selectedDoctor.drSurgery.events.push(data);
                     break;
                     }

                     // hide the appointment form
                     hideFormSvc.hideForm();

                     })
                     .error(function (data) {

                     // there are NO patients in the appointment after the deletion
                     $log.warn("No more patients left in the appointment");

                     switch (self.scope.fields.appointmentType) {

                     case "Screening":
                     var appointmentIndex = 0;

                     angular.forEach(self.scope.selectedDoctor.drScreening.events, function (screeningAppointment) {

                     if (screeningAppointment.id === self.scope.fields.appointmentId) {

                     self.scope.selectedDoctor.drScreening.events.splice(appointmentIndex, 1);

                     }
                     appointmentIndex++;
                     });
                     break;

                     case "Pre Evaluation":
                     var appointmentIndex = 0;

                     angular.forEach(self.scope.selectedDoctor.drPreEval.events, function (preEvaluationAppointment) {

                     if (preEvaluationAppointment.id === self.scope.fields.appointmentId) {

                     self.scope.selectedDoctor.drPreEval.events.splice(appointmentIndex, 1);

                     }
                     appointmentIndex++;
                     });
                     break;

                     case "Surgery":
                     var appointmentIndex = 0;

                     angular.forEach(self.scope.selectedDoctor.drSurgery.events, function (surgeryAppointment) {

                     if (surgeryAppointment.id === self.scope.fields.appointmentId) {

                     self.scope.selectedDoctor.drScreening.events.splice(appointmentIndex, 1);

                     }
                     appointmentIndex++;
                     });
                     break;
                     }

                     // hide the appointment form
                     hideFormSvc.hideForm();

                     });*/

                }).error(function (error) {

                    $rootScope.spinner = {active: false};
                    showNotificationsSvc.notifyErrorTemplate('Error deleting appointment');
                    $log.error("Error deleting appointment");
                });

        }

    });