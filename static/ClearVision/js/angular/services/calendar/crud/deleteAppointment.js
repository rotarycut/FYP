angular.module('delete.appointment', [])
    .service('deleteAppointmentSvc', function ($http, hideFormSvc, getNotificationsSvc) {

        var self = this;
        self.scope = {};

        self.getScope = function (scope) {
            self.scope = scope;
        };

        self.deleteAppointment = function (reasonId) {

            var req = {
                method: 'DELETE',
                url: '/Clearvision/_api/appointmentsCUD/' + self.scope.fields.appointmentId,
                headers: {'Content-Type': 'application/json'},
                data: {
                    "id": self.scope.fields.patientId,
                    "cancellationReasonID": reasonId
                }
            };

            $http(req)
                .success(function (data) {
                    console.log("Successfully deleted. Retrieved swapped content.");

                    var event = data;

                    // Find if any more patients in the appointment
                    var urlStr = '/Clearvision/_api/appointments/' + self.scope.fields.appointmentId;

                    $http.get(urlStr)
                        .success(function (data) {
                            console.log("There still exist patients in the appointment");
                            console.log(data);
                            var event = data;

                            switch (self.scope.fields.appointmentType) {

                                case "Screening":
                                    var appointmentIndex = 0;
                                    angular.forEach(self.scope.selectedDoctor.drScreening.events, function (screeningAppointment) {
                                        if (screeningAppointment.id === self.scope.fields.appointmentId) {

                                            self.scope.selectedDoctor.drScreening.events.splice(appointmentIndex, 1);

                                        }
                                        appointmentIndex++;
                                    });

                                    self.scope.selectedDoctor.drScreening.events.push(event);
                                    break;

                                case "Pre Evaluation":
                                    var appointmentIndex = 0;
                                    angular.forEach(self.scope.selectedDoctor.drPreEval.events, function (preEvaluationAppointment) {
                                        if (preEvaluationAppointment.id === self.scope.fields.appointmentId) {

                                            self.scope.selectedDoctor.drPreEval.events.splice(appointmentIndex, 1);

                                        }
                                        appointmentIndex++;
                                    });

                                    self.scope.selectedDoctor.drPreEval.events.push(event);
                                    break;

                                case "Surgery":
                                    var appointmentIndex = 0;
                                    angular.forEach(self.scope.selectedDoctor.drSurgery.events, function (surgeryAppointment) {
                                        if (surgeryAppointment.id === self.scope.fields.appointmentId) {

                                            self.scope.selectedDoctor.drSurgery.events.splice(appointmentIndex, 1);

                                        }
                                        appointmentIndex++;
                                    });

                                    self.scope.selectedDoctor.drSurgery.events.push(event);
                                    break;
                            }
                            //getNotificationsSvc.getNotifications();
                            hideFormSvc.hideForm();

                        })
                        .error(function (data) {
                            console.log("No more patients left in the appointment");

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
                            //getNotificationsSvc.getNotifications();
                            hideFormSvc.hideForm();

                        });

                })

        };

    });