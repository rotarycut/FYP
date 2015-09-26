angular.module('post.appointment', [])
    .service('postAppointmentSvc', function ($http, $log, disableIScheduleSvc, clearFormSvc) {

        var self = this;
        self.scope = {};

        self.getScope = function (scope) {
            self.scope = scope;
        };


        /*******************************************************************************
         function to post appointment
         *******************************************************************************/


        self.postAppointment = function (createObject, isFromSocket) {

            // check if it is a call from the socket
            if (isFromSocket) {

                // check the appointment type of the created appointment
                switch (createObject.apptType) {

                    case "Screening":
                        var appointmentIndex = 0;

                        // loop through all the screening events of the selected doctor
                        angular.forEach(self.scope.selectedDoctor.drScreening.events, function (screeningAppointment) {

                            // find if the created appointment is in the existing pool of screening events
                            if (screeningAppointment.id === createObject.id) {

                                // remove the entire appointment from the calendar
                                self.scope.selectedDoctor.drScreening.events.splice(appointmentIndex, 1);
                            }
                            appointmentIndex++;
                        });

                        // add the updated appointment with addition of patient back into the calendar
                        self.scope.selectedDoctor.drScreening.events.push(createObject);
                        break;

                    case "Pre Evaluation":
                        var appointmentIndex = 0;

                        angular.forEach(self.scope.selectedDoctor.drPreEval.events, function (preEvaluationAppointment) {

                            if (preEvaluationAppointment.id === createObject.id) {

                                self.scope.selectedDoctor.drPreEval.events.splice(appointmentIndex, 1);
                            }
                            appointmentIndex++;
                        });

                        self.scope.selectedDoctor.drPreEval.events.push(createObject);
                        break;

                    case "Surgery":
                        var appointmentIndex = 0;

                        angular.forEach(self.scope.selectedDoctor.drSurgery.events, function (surgeryAppointment) {

                            if (surgeryAppointment.id === createObject.id) {
                                self.scope.selectedDoctor.drSurgery.events.splice(appointmentIndex, 1);
                            }
                            appointmentIndex++;
                        });

                        self.scope.selectedDoctor.drSurgery.events.push(createObject);
                        break;

                }


            } else {

                // the call is NOT from the socket

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

                console.log({
                    "apptType": self.scope.fields.appointmentType,
                    "date": self.scope.fields.appointmentDate,
                    "docID": self.scope.fields.doctorAssigned,
                    "clinicID": 1,
                    "contact": self.scope.fields.patientContact,
                    "name": self.scope.fields.patientName,
                    "gender": "Male",
                    "channelID": self.scope.fields.marketingChannel.id.toString(),
                    "time": self.scope.fields.appointmentTime,
                    "remarks": self.scope.fields.appointmentRemarks,
                    "waitingListFlag": self.scope.fields.waitingList,
                    "tempDate": self.scope.fields.waitingDate,
                    "tempTime": self.scope.fields.waitingTime
                });

                $http.post('/Clearvision/_api/appointmentsCUD/', {
                    "apptType": self.scope.fields.appointmentType,
                    "date": self.scope.fields.appointmentDate,
                    "docID": self.scope.fields.doctorAssigned,
                    "clinicID": 1,
                    "contact": self.scope.fields.patientContact,
                    "name": self.scope.fields.patientName,
                    "gender": "Male",
                    "channelID": self.scope.fields.marketingChannel.id.toString(),
                    "time": self.scope.fields.appointmentTime,
                    "remarks": self.scope.fields.appointmentRemarks,
                    "waitingListFlag": self.scope.fields.waitingList,
                    "tempDate": self.scope.fields.waitingDate,
                    "tempTime": self.scope.fields.waitingTime
                })
                    .success(function (data) {

                        $log.info("Successful with creating appointment");

                        // check the appointment type of the created appointment
                        switch (self.scope.fields.appointmentType) {

                            case "Screening":
                                var appointmentIndex = 0;

                                // loop through all the screening events of the selected doctor
                                angular.forEach(self.scope.selectedDoctor.drScreening.events, function (screeningAppointment) {

                                    // find if the created appointment is in the existing pool of screening events
                                    if (screeningAppointment.id === data.id) {

                                        // remove the entire appointment from the calendar
                                        self.scope.selectedDoctor.drScreening.events.splice(appointmentIndex, 1);
                                    }
                                    appointmentIndex++;
                                });

                                // add the updated appointment with addition of patient back into the calendar
                                self.scope.selectedDoctor.drScreening.events.push(data);
                                break;

                            case "Pre Evaluation":
                                var appointmentIndex = 0;

                                angular.forEach(self.scope.selectedDoctor.drPreEval.events, function (preEvaluationAppointment) {

                                    if (preEvaluationAppointment.id === data.id) {
                                        self.scope.selectedDoctor.drPreEval.events.splice(appointmentIndex, 1);
                                    }
                                    appointmentIndex++;
                                });

                                self.scope.selectedDoctor.drPreEval.events.push(data);
                                break;

                            case "Surgery":
                                var appointmentIndex = 0;
                                angular.forEach(self.scope.selectedDoctor.drSurgery.events, function (surgeryAppointment) {

                                    if (surgeryAppointment.id === data.id) {
                                        self.scope.selectedDoctor.drSurgery.events.splice(appointmentIndex, 1);
                                    }
                                    appointmentIndex++;
                                });

                                self.scope.selectedDoctor.drSurgery.events.push(data);
                                break;
                        }

                        // disable iSchedule
                        disableIScheduleSvc.disableISchedule();

                        // clear the appointment form
                        clearFormSvc.clearForm();
                    })

                    .error(function (data) {

                        $log.error("Error creating appointment");
                    });

            }

        };

    });