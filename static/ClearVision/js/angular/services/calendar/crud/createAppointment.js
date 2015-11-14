angular.module('post.appointment', [])
    .service('postAppointmentSvc', function ($http, $log, $filter, disableIScheduleSvc, clearFormSvc, showNotificationsSvc) {

        var self = this;
        self.scope = {};

        self.getScope = function (scope) {
            self.scope = scope;
        };

        /*******************************************************************************
         function to post appointment
         *******************************************************************************/

        self.postAppointment = function () {

            if (self.scope.fields.appointmentRemarks === undefined) {
                self.scope.fields.appointmentRemarks = "";
            }

            if (self.scope.fields.waitingList === undefined) {
                self.scope.fields.waitingList = false;
            }

            if (self.scope.fields.appointmentDate === undefined) {
                self.scope.fields.appointmentDate = "";
            }

            if (self.scope.fields.waitingTime === undefined) {
                self.scope.fields.waitingTime = "";
            }

            var req = {
                method: 'POST',
                url: '/Clearvision/_api/appointmentsCUD/',
                headers: {'Content-Type': 'application/json'},
                data: {
                    "apptType": self.scope.fields.appointmentType.name,
                    "date": $filter('dateFilter')(self.scope.fields.appointmentDate, 'shortDate'),
                    "docID": self.scope.fields.doctorAssigned.id,
                    "clinicID": 1,
                    "contact": self.scope.fields.patientContact,
                    "name": self.scope.fields.patientName,
                    "gender": "Male",
                    "channelID": self.scope.fields.marketingChannel.id.toString(),
                    "time": self.scope.fields.appointmentTime,
                    "remarks": self.scope.fields.appointmentRemarks,
                    "waitingListFlag": self.scope.fields.waitingList,
                    "tempDate": self.scope.fields.waitingDate,
                    "tempTime": self.scope.fields.waitingTime,
                    "socketId": self.scope.socketId
                }
            };

            $http(req)
                .success(function (appointment) {

                    showNotificationsSvc.notifySuccessTemplate('Appointment created successfully');

                    // check the appointment type of the created appointment
                    switch (self.scope.fields.appointmentType) {

                        case "Screening":
                            var appointmentIndex = 0;

                            // loop through all the screening events of the selected doctor
                            angular.forEach(self.scope.selectedDoctor.drScreening.events, function (screeningAppointment) {

                                // find if the created appointment is in the existing pool of screening events
                                if (screeningAppointment.id === appointment.id) {

                                    // remove the entire appointment from the calendar
                                    self.scope.selectedDoctor.drScreening.events.splice(appointmentIndex, 1);
                                }
                                appointmentIndex++;
                            });

                            // add the updated appointment with addition of patient back into the calendar
                            self.scope.selectedDoctor.drScreening.events.push(appointment);
                            break;

                        case "Pre Evaluation":
                            var appointmentIndex = 0;

                            angular.forEach(self.scope.selectedDoctor.drPreEval.events, function (preEvaluationAppointment) {

                                if (preEvaluationAppointment.id === appointment.id) {
                                    self.scope.selectedDoctor.drPreEval.events.splice(appointmentIndex, 1);
                                }
                                appointmentIndex++;
                            });

                            self.scope.selectedDoctor.drPreEval.events.push(appointment);
                            break;

                        case "Surgery":
                            var appointmentIndex = 0;
                            angular.forEach(self.scope.selectedDoctor.drSurgery.events, function (surgeryAppointment) {

                                if (surgeryAppointment.id === appointment.id) {
                                    self.scope.selectedDoctor.drSurgery.events.splice(appointmentIndex, 1);
                                }
                                appointmentIndex++;
                            });

                            self.scope.selectedDoctor.drSurgery.events.push(appointment);
                            break;
                    }

                    // disable iSchedule
                    disableIScheduleSvc.disableISchedule();

                    // clear the appointment form
                    clearFormSvc.clearForm();

                }).error(function (error) {

                    $log.error("Error creating appointment");
                });

        };
    });