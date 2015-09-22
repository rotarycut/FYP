angular.module('post.appointment', [])
    .service('postAppointmentSvc', function ($http, disableIScheduleSvc, clearFormSvc) {

        var self = this;
        self.scope = {};

        self.getScope = function (scope) {
            self.scope = scope;
        };

        self.postAppointment = function (createObject, isFromSocket) {
            //var formattedDate = self.scope.getFormattedDate(self.scope.fields.appointmentDate);

            if (isFromSocket) {

                switch (createObject.apptType) {

                    case "Screening":
                        var appointmentIndex = 0;

                        angular.forEach(self.scope.selectedDoctor.drScreening.events, function (screeningAppointment) {
                            if (screeningAppointment.id === createObject.id) {
                                self.scope.selectedDoctor.drScreening.events.splice(appointmentIndex, 1);
                            }
                            appointmentIndex++;
                        });
                        self.scope.selectedDoctor.drScreening.events.push(createObject);
                        break;

                    case "Pre Evaluation":
                        var appointmentIndex = 0;
                        angular.forEach(self.scope.drHoPreEvaluations.events, function (preEvaluationAppointment) {
                            if (preEvaluationAppointment.id === createObject.id) {
                                self.scope.selectedDoctor.drPreEval.events.splice(appointmentIndex, 1);
                            }
                            appointmentIndex++;
                        });
                        self.scope.selectedDoctor.drPreEval.events.push(createObject);
                        break;

                    case "Surgery":
                        var appointmentIndex = 0;
                        angular.forEach(self.scope.drHoSurgeries.events, function (surgeryAppointment) {
                            if (surgeryAppointment.id === createObject.id) {
                                self.scope.selectedDoctor.drSurgery.events.splice(appointmentIndex, 1);
                            }
                            appointmentIndex++;
                        });
                        self.scope.selectedDoctor.drSurgery.events.push(createObject);
                        break;
                }
            }

            if (self.scope.fields.appointmentRemarks === undefined) {
                self.scope.fields.appointmentRemarks = "";
            }

            /*if (self.scope.fields.waitingDate !== undefined) {
             var formattedWaitingDate = self.scope.getFormattedDate(self.scope.fields.waitingDate);
             }*/

            if (self.scope.fields.waitingList === undefined) {
                self.scope.fields.waitingList = false;
            }

            if (self.scope.fields.appointmentDate === undefined) {
                self.scope.fields.appointmentDate = "";
            }

            if (self.scope.fields.waitingTime === undefined) {
                self.scope.fields.waitingTime = "";
            }

            if (self.scope.fields.doctorAssigned === "Dr Ho") {
                self.scope.fields.doctorAssigned = "2";
            } else {
                self.scope.fields.doctorAssigned = "1";
            }

            $http.post('/Clearvision/_api/appointmentsCUD/', {
                "apptType": self.scope.fields.appointmentType,
                "date": self.scope.fields.appointmentDate,
                "docID": self.scope.fields.doctorAssigned,
                "clinicID": 1,
                "contact": self.scope.fields.patientContact,
                "name": self.scope.fields.patientName,
                "gender": "Male",
                "channelID": "1",
                "time": self.scope.fields.appointmentTime,
                "remarks": self.scope.fields.appointmentRemarks,
                "waitingListFlag": self.scope.fields.waitingList,
                "tempDate": self.scope.fields.waitingDate,
                "tempTime": self.scope.fields.waitingTime
            })
                .success(function (data) {
                    console.log("Successful with http post");

                    var event = data;
                    //console.log(self.scope.selectedDoctor.drScreening);
                    //console.log(self.scope.selectedDoctor.drScreening.events);
                    //console.log(data);

                    switch (self.scope.fields.appointmentType) {

                        case "Screening":
                            var appointmentIndex = 0;

                            angular.forEach(self.scope.selectedDoctor.drScreening.events, function (screeningAppointment) {
                                if (screeningAppointment.id === event.id) {
                                    self.scope.selectedDoctor.drScreening.events.splice(appointmentIndex, 1);
                                }
                                appointmentIndex++;
                            });
                            self.scope.selectedDoctor.drScreening.events.push(data);
                            break;

                        case "Pre Evaluation":
                            var appointmentIndex = 0;
                            angular.forEach(self.scope.drHoPreEvaluations.events, function (preEvaluationAppointment) {
                                if (preEvaluationAppointment.id === event.id) {
                                    self.scope.selectedDoctor.drPreEval.events.splice(appointmentIndex, 1);
                                }
                                appointmentIndex++;
                            });
                            self.scope.selectedDoctor.drPreEval.events.push(data);
                            break;

                        case "Surgery":
                            var appointmentIndex = 0;
                            angular.forEach(self.scope.drHoSurgeries.events, function (surgeryAppointment) {
                                if (surgeryAppointment.id === event.id) {
                                    self.scope.selectedDoctor.drSurgery.events.splice(appointmentIndex, 1);
                                }
                                appointmentIndex++;
                            });
                            self.scope.selectedDoctor.drSurgery.events.push(data);
                            break;
                    }

                    disableIScheduleSvc.disableISchedule();
                    clearFormSvc.clearForm();
                })

                .error(function (data) {
                    console.log("Error with http post");
                });
        };

    });