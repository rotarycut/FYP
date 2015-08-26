angular.module('post.appointment', [])
    .service('postAppointmentSvc', function ($http, disableIScheduleSvc) {

        var self = this;
        self._scope = {};

        self.test = [];
        self.test.push({event: "yes"});

        self.getScope = function (scope) {
            self._scope = scope;
            /*var scopeTest = scope;

             console.log(scopeTest);

             var event = {
             apptType: "Surgery",
             color: "#74aaf7",
             date: "2015-08-12",
             doctor: 2,
             start: "2015-08-10 09:30:00",
             end: "2015-08-10 10:00:00",
             };
             this._scope.drHoScreenings.events.push(event);
             console.log(this._scope);*/

        };


        self.postAppointment = function () {
            //var formattedDate = self._scope.getFormattedDate(self._scope.fields.appointmentDate);

            if (self._scope.fields.appointmentRemarks === undefined) {
                self._scope.fields.appointmentRemarks = "";
            }

            /*if (self._scope.fields.waitingDate !== undefined) {
             var formattedWaitingDate = self._scope.getFormattedDate(self._scope.fields.waitingDate);
             }*/

            if (self._scope.fields.waitingList === undefined) {
                self._scope.fields.waitingList = false;
            }

            if (self._scope.fields.appointmentDate === undefined) {
                self._scope.fields.appointmentDate = "";
            }

            if (self._scope.fields.waitingTime === undefined) {
                self._scope.fields.waitingTime = "";
            }

            if (self._scope.fields.doctorAssigned === "Dr. Ho") {
                self._scope.fields.doctorAssigned = "2";
            } else {
                self._scope.fields.doctorAssigned = "1";
            }

            var sending = {
                "apptType": self._scope.fields.appointmentType,
                "date": self._scope.fields.appointmentDate,
                "docID": self._scope.fields.doctorAssigned,
                "clinicID": 1,
                "contact": self._scope.fields.patientContact,
                "name": self._scope.fields.patientName,
                "gender": "Male",
                "channelID": "1",
                "time": self._scope.fields.appointmentTime,
                "remarks": self._scope.fields.appointmentRemarks,
                "waitingListFlag": self._scope.fields.waitingList,
                "tempDate": self._scope.fields.waitingDate,
                "tempTime": self._scope.fields.waitingTime
            };

            $http.post('/Clearvision/_api/appointmentsCUD/', {
                "apptType": self._scope.fields.appointmentType,
                "date": self._scope.fields.appointmentDate,
                "docID": self._scope.fields.doctorAssigned,
                "clinicID": 1,
                "contact": self._scope.fields.patientContact,
                "name": self._scope.fields.patientName,
                "gender": "Male",
                "channelID": "1",
                "time": self._scope.fields.appointmentTime,
                "remarks": self._scope.fields.appointmentRemarks,
                "waitingListFlag": self._scope.fields.waitingList,
                "tempDate": self._scope.fields.waitingDate,
                "tempTime": self._scope.fields.waitingTime
            })
                .success(function (data) {
                    console.log("Successful with http post");
                    console.log(data);

                    //console.log(self._scope);
                    var event = data;

                    switch (self._scope.fields.appointmentType) {

                        case "Screening":
                            var appointmentIndex = 0;
                            angular.forEach(self._scope.drHoScreenings.events, function (screeningAppointment) {
                                if (screeningAppointment.id === event.id) {
                                    self._scope.drHoScreenings.events.splice(appointmentIndex, 1);
                                }
                                appointmentIndex++;
                            });
                            //self._scope.drHoScreenings.events.push(event);
                            break;

                        case "Pre Evaluation":
                            var appointmentIndex = 0;
                            angular.forEach(self._scope.drHoPreEvaluations.events, function (preEvaluationAppointment) {
                                if (preEvaluationAppointment.id === event.id) {
                                    self._scope.drHoPreEvaluations.events.splice(appointmentIndex, 1);

                                }
                                appointmentIndex++;
                            });
                            //self._scope.drHoPreEvaluations.events.push(event);
                            break;

                        case "Surgery":
                            var appointmentIndex = 0;
                            angular.forEach(self._scope.drHoSurgeries.events, function (surgeryAppointment) {
                                if (surgeryAppointment.id === event.id) {
                                    self._scope.drHoSurgeries.events.splice(appointmentIndex, 1);

                                }
                                appointmentIndex++;
                            });

                            //self._scope.drHoSurgeries.events.push(event);
                            break;
                    }

                    disableIScheduleSvc.disableISchedule();
                })

                .error(function (data) {
                    console.log("Error with http post");
                });
        };

    });