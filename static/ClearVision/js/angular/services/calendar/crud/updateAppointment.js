angular.module('update.appointment', [])
    .service('updateAppointmentSvc', function ($http, hideFormSvc) {

        var self = this;
        self._scope = {};

        self.getScope = function (scope) {
            self._scope = scope;
        };

        self.updateAppointment = function () {

            if (self._scope.fields.appointmentRemarks === undefined) {
                self._scope.fields.appointmentRemarks = "";
            }

            if (self._scope.fields.doctorAssigned === "Dr Ho") {
                self._scope.fields.doctorAssigned = "2";
                self._scope.doctorScreening = self._scope.drHoScreenings;
                self._scope.doctorPreEval = self._scope.drHoPreEvaluations;
                self._scope.doctorSurgery = self._scope.drHoSurgeries;
            } else {
                self._scope.fields.doctorAssigned = "1";
                self._scope.doctorScreening = self._scope.drGohScreenings;
                self._scope.doctorPreEval = self._scope.drGohPreEvaluations;
                self._scope.doctorSurgery = self._scope.drGohSurgeries;
            }

            var updateJson = {
                "contact": self._scope.fields.patientContact,
                "replacementApptDate": self._scope.fields.appointmentDate,
                "replacementApptTime": self._scope.fields.appointmentTime,
                "type": self._scope.fields.appointmentType,
                "docID": self._scope.fields.doctorAssigned,
                "clinicID": 1,
                "remarks": self._scope.fields.appointmentRemarks
            };

            console.log(updateJson);

            var urlStr = '/Clearvision/_api/appointmentsCUD/' + self._scope.fields.appointmentId;
            console.log(urlStr);
            var req = {
                method: 'PATCH',
                url: urlStr,
                headers: {'Content-Type': 'application/json'},
                data: updateJson
            };

            $http(req)
                .success(function (data) {
                    console.log("Successfully updated");
                    console.log(data);

                    var event = data;

                    switch (self._scope.fields.appointmentType) {

                        case "Screening":
                            self._scope.spliceAppointment(self._scope.doctorScreening.events, event.id);
                            //self._scope.drHoScreenings.events.push(event);
                            break;

                        case "Pre Evaluation":
                            self._scope.spliceAppointment(self._scope.doctorPreEval.events, event.id);
                            //self._scope.drHoPreEvaluations.events.push(event);
                            break;

                        case "Surgery":
                            self._scope.spliceAppointment(self._scope.doctorSurgery.events, event.id);
                            //self._scope.drHoSurgeries.events.push(event);
                            break;
                    }

                    // handle the update of the old appointment
                    if (self._scope.fields.originalAppointmentType !== self._scope.fields.appointmentType) {
                        console.log("Update old different appointment type");
                        var id = self._scope.fields.appointmentId;

                        switch (self._scope.fields.originalAppointmentType) {

                            case "Screening":
                                self._scope.spliceAppointment(self._scope.doctorScreening.events, id);

                                $http.get('/Clearvision/_api/appointments/' + id)
                                    .success(function (oldAppointment) {
                                        //self._scope.drHoScreenings.events.push(oldAppointment);
                                    });
                                break;

                            case "Pre Evaluation":
                                self._scope.spliceAppointment(self._scope.doctorPreEval.events, id);

                                $http.get('/Clearvision/_api/appointments/' + id)
                                    .success(function (oldAppointment) {
                                        //self._scope.drHoPreEvaluations.events.push(oldAppointment);
                                    });
                                break;

                            case "Surgery":
                                self._scope.spliceAppointment(self._scope.doctorSurgery.events, id);

                                $http.get('/Clearvision/_api/appointments/' + id)
                                    .success(function (oldAppointment) {
                                        //self._scope.drHoSurgeries.events.push(oldAppointment)
                                    });
                                break;
                        }
                    } else {
                        console.log("Update old same appointment type");
                        var id = self._scope.fields.appointmentId;

                        switch (self._scope.fields.appointmentType) {

                            case "Screening":
                                self._scope.spliceAppointment(self._scope.doctorScreening.events, id);

                                $http.get('/Clearvision/_api/appointments/' + id)
                                    .success(function (oldAppointment) {
                                        //self._scope.drHoScreenings.events.push(oldAppointment);
                                    });
                                break;

                            case "Pre Evaluation":
                                self._scope.spliceAppointment(self._scope.doctorPreEval.events, id);

                                $http.get('/Clearvision/_api/appointments/' + id)
                                    .success(function (oldAppointment) {
                                        //self._scope.drHoPreEvaluations.events.push(oldAppointment);
                                    });
                                break;

                            case "Surgery":
                                self._scope.spliceAppointment(self._scope.doctorSurgery.events, id);

                                $http.get('/Clearvision/_api/appointments/' + id)
                                    .success(function (oldAppointment) {
                                        //self._scope.drHoSurgeries.events.push(oldAppointment)
                                    });
                                break;
                        }
                    }

                    hideFormSvc.hideForm();
                })

                .error(function (data) {
                    console.log("Error with updating appointment");
                });

        };

    });