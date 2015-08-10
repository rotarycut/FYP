angular.module('post.appointment', [])
    .service('postAppointmentSvc', function ($http) {

        this._scope = {};

        this.test = [];
        this.test.push({event: "yes"});

        this.getScope = function (scope) {
            this._scope = scope;
            var scopeTest = scope;
            console.log(this._scope);
            console.log(scopeTest);
        };

        this.postAppointment = function () {
            var formattedDate = this._scope.getFormattedDate(this._scope.fields.appointmentDate);

            if (this._scope.fields.appointmentRemarks === undefined) {
                this._scope.fields.appointmentRemarks = "";
            }

            if (this._scope.fields.waitingDate !== undefined) {
                var formattedWaitingDate = this._scope.getFormattedDate(this._scope.fields.waitingDate);
            }

            if (this._scope.fields.waitingList === undefined) {
                this._scope.fields.waitingList = false;
            }

            if (this._scope.fields.appointmentDate === undefined) {
                this._scope.fields.appointmentDate = "";
            }

            if (this._scope.fields.waitingTime === undefined) {
                this._scope.fields.waitingTime = "";
            }

            var sending = {
                "apptType": this._scope.fields.appointmentType,
                "date": formattedDate,
                "docID": this._scope.fields.doctorAssigned,
                "clinicID": 1,
                "contact": this._scope.fields.patientContact,
                "name": this._scope.fields.patientName,
                "gender": "Male",
                "channelID": "1",
                "time": this._scope.fields.appointmentTime,
                "remarks": this._scope.fields.appointmentRemarks,
                "waitingListFlag": this._scope.fields.waitingList,
                "tempDate": formattedWaitingDate,
                "tempTime": this._scope.fields.waitingTime
            };

            console.log(sending);

            $http.post('/Clearvision/_api/appointmentsCUD/', {
                "apptType": this._scope.fields.appointmentType,
                "date": formattedDate,
                "docID": this._scope.fields.doctorAssigned,
                "clinicID": 1,
                "contact": this._scope.fields.patientContact,
                "name": this._scope.fields.patientName,
                "gender": "Male",
                "channelID": "1",
                "time": this._scope.fields.appointmentTime,
                "remarks": this._scope.fields.appointmentRemarks,
                "waitingListFlag": this._scope.fields.waitingList,
                "tempDate": formattedWaitingDate,
                "tempTime": this._scope.fields.waitingTime
            })
                .success(function (data) {
                    console.log("Successful with http post");
                    console.log(data);
                    console.log(this._scope);
                    var event = data;

                    switch (sending.apptType) {

                        case "Screening":
                            console.log("SCREENING");
                            console.log(this._scope);
                            var appointmentIndex = 0;
                            angular.forEach(this._scope.drHoScreenings.events, function (screeningAppointment) {
                                if (screeningAppointment.start === event.start) {
                                    //this._scope.drHoScreenings.events.splice(appointmentIndex, 1);

                                }
                                appointmentIndex++;
                            });

                            //this._scope.drHoScreenings.events.push(event);
                            break;

                        case "Pre Evaluation":
                            var appointmentIndex = 0;
                            angular.forEach($this._scope.drHoPreEvaluations.events, function (preEvaluationAppointment) {
                                if (preEvaluationAppointment.start === event.start) {
                                    this._scope.drHoPreEvaluations.events.splice(appointmentIndex, 1);

                                }
                                appointmentIndex++;
                            });
                            this._scope.drHoPreEvaluations.events.push(event);
                            break;

                        case "Surgery":
                            var appointmentIndex = 0;
                            angular.forEach(this._scope.drHoSurgeries.events, function (surgeryAppointment) {
                                if (surgeryAppointment.start === event.start) {
                                    this._scope.drHoSurgeries.events.splice(appointmentIndex, 1);

                                }
                                appointmentIndex++;
                            });

                            this._scope.drHoSurgeries.events.push(event);
                            break;
                    }

                })

                .error(function (data) {
                    console.log("Error with http post");
                });
        };

    });