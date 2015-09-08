angular.module('delete.appointment', [])
    .service('deleteAppointmentSvc', function ($http, hideFormSvc, getNotificationsSvc) {

        var self = this;
        self._scope = {};

        self.getScope = function (scope) {
            self._scope = scope;
        };

        self.deleteAppointment = function () {

            var url = '/Clearvision/_api/appointmentsCUD/' + self._scope.fields.appointmentId;

            var req = {
                method: 'DELETE',
                url: url,
                headers: {'Content-Type': 'application/json'},
                data: {
                    "contact": self._scope.fields.patientContact
                }
            };

            $http(req)
                .success(function (data) {
                    console.log("Successfully deleted. Retrieved swapped content.");
                    console.log(data);

                    var event = data;
                    var appointmentsCanBeSwapped = Object.keys(event).length;

                    if (appointmentsCanBeSwapped != 0) {
                        // Then I perform some swap.
                        console.log("Some swapped being done");
                    }

                    // Find if any more patients in the appointment
                    var urlStr = '/Clearvision/_api/appointments/' + self._scope.fields.appointmentId;

                    $http.get(urlStr)
                        .success(function (data) {
                            console.log("There still exist patients in the appointment");
                            console.log(data);
                            var event = data;

                            switch (self._scope.fields.appointmentType) {

                                case "Screening":
                                    var appointmentIndex = 0;
                                    angular.forEach(self._scope.drHoScreenings.events, function (screeningAppointment) {
                                        if (screeningAppointment.id === self._scope.fields.appointmentId) {

                                            self._scope.drHoScreenings.events.splice(appointmentIndex, 1);

                                        }
                                        appointmentIndex++;
                                    });
                                    //self._scope.drHoScreenings.events.push(event);
                                    break;

                                case "Pre Evaluation":
                                    var appointmentIndex = 0;
                                    angular.forEach(self._scope.drHoPreEvaluations.events, function (preEvaluationAppointment) {
                                        if (preEvaluationAppointment.id === self._scope.fields.appointmentId) {
                                            self._scope.drHoPreEvaluations.events.splice(appointmentIndex, 1);

                                        }
                                        appointmentIndex++;
                                    });
                                    //self._scope.drHoPreEvaluations.events.push(event);
                                    break;

                                case "Surgery":
                                    var appointmentIndex = 0;
                                    angular.forEach(self._scope.drHoSurgeries.events, function (surgeryAppointment) {
                                        if (surgeryAppointment.id === self._scope.fields.appointmentId) {
                                            self._scope.drHoSurgeries.events.splice(appointmentIndex, 1);

                                        }
                                        appointmentIndex++;
                                    });
                                    //self._scope.drHoSurgeries.events.push(event);
                                    break;
                            }
                            getNotificationsSvc.getNotifications();
                            hideFormSvc.hideForm();

                        })
                        .error(function (data) {
                            console.log("No more patients left in the appointment");

                            switch (self._scope.fields.appointmentType) {

                                case "Screening":
                                    var appointmentIndex = 0;
                                    angular.forEach(self._scope.drHoScreenings.events, function (screeningAppointment) {
                                        if (screeningAppointment.id === self._scope.fields.appointmentId) {

                                            self._scope.drHoScreenings.events.splice(appointmentIndex, 1);

                                        }
                                        appointmentIndex++;
                                    });
                                    break;

                                case "Pre Evaluation":
                                    var appointmentIndex = 0;
                                    angular.forEach(self._scope.drHoPreEvaluations.events, function (preEvaluationAppointment) {
                                        if (preEvaluationAppointment.id === self._scope.fields.appointmentId) {

                                            self._scope.drHoPreEvaluations.events.splice(appointmentIndex, 1);

                                        }
                                        appointmentIndex++;
                                    });
                                    break;

                                case "Surgery":
                                    var appointmentIndex = 0;
                                    angular.forEach(self._scope.drHoSurgeries.events, function (surgeryAppointment) {
                                        if (surgeryAppointment.id === self._scope.fields.appointmentId) {

                                            self._scope.drHoSurgeries.events.splice(appointmentIndex, 1);

                                        }
                                        appointmentIndex++;
                                    });
                                    break;
                            }
                            getNotificationsSvc.getNotifications();
                            hideFormSvc.hideForm();

                        });

                })

        };

    });