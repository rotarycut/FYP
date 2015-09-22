angular.module('update.appointment', [])
    .service('updateAppointmentSvc', function ($http, $location, hideFormSvc) {

        var self = this;
        self.scope = {};

        self.getScope = function (scope) {
            self.scope = scope;
        };

        self.updateAppointment = function () {

            console.log(self.scope.selectedDoctor);

            if (self.scope.fields.appointmentRemarks === undefined) {
                self.scope.fields.appointmentRemarks = "";
            }

            if (self.scope.fields.doctorAssigned === "Dr Ho") {
                self.scope.fields.doctorAssigned = "2";
                self.scope.doctorScreening = self.scope.drHoScreenings;
                self.scope.doctorPreEval = self.scope.drHoPreEvaluations;
                self.scope.doctorSurgery = self.scope.drHoSurgeries;
            } else {
                self.scope.fields.doctorAssigned = "1";
                self.scope.doctorScreening = self.scope.drGohScreenings;
                self.scope.doctorPreEval = self.scope.drGohPreEvaluations;
                self.scope.doctorSurgery = self.scope.drGohSurgeries;
            }

            var updateJson = {
                "id": self.scope.fields.patientId,
                "replacementApptDate": self.scope.fields.appointmentDate,
                "replacementApptTime": self.scope.fields.appointmentTime,
                "type": self.scope.fields.appointmentType,
                "docID": self.scope.fields.doctorAssigned,
                "clinicID": 1,
                "remarks": self.scope.fields.appointmentRemarks,
                "patientName": self.scope.fields.patientName,
                "patientContact": self.scope.fields.patientContact
            };

            console.log(updateJson);

            var req = {
                method: 'PATCH',
                url: '/Clearvision/_api/appointmentsCUD/' + self.scope.fields.appointmentId,
                headers: {'Content-Type': 'application/json'},
                data: updateJson
            };

            $http(req)
                .success(function (data) {
                    console.log("Successfully updated");

                    var event = data;

                    //console.log(self.scope.fields.appointmentType);
                    //console.log(self.scope.selectedDoctor);

                    switch (self.scope.fields.appointmentType) {

                        case "Screening":

                            self.scope.spliceAppointment(self.scope.selectedDoctor.drScreening.events, event.id);
                            self.scope.drHoScreenings.events.push(event);
                            break;

                        case "Pre Evaluation":

                            self.scope.spliceAppointment(self.scope.selectedDoctor.drPreEval.events, event.id);
                            self.scope.drHoScreenings.events.push(event);
                            break;

                        case "Surgery":

                            self.scope.spliceAppointment(self.scope.selectedDoctor.drSurgery.events, event.id);
                            self.scope.drHoScreenings.events.push(event);
                            break;
                    }

                    // handle the update of the old appointment
                    if (self.scope.fields.originalAppointmentType !== self.scope.fields.appointmentType) {
                        console.log("Update old different appointment type");
                        var id = self.scope.fields.appointmentId;

                        switch (self.scope.fields.originalAppointmentType) {

                            case "Screening":
                                self.scope.spliceAppointment(self.scope.selectedDoctor.drScreening.events, id);

                                $http.get('/Clearvision/_api/appointments/' + id)
                                    .success(function (oldAppointment) {
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
                    } else {
                        console.log("Update old same appointment type");
                        var id = self.scope.fields.appointmentId;
                        console.log(self.scope.fields.appointmentType);

                        switch (self.scope.fields.appointmentType) {

                            case "Screening":
                                self.scope.spliceAppointment(self.scope.selectedDoctor.drScreening.events, id);

                                $http.get('/Clearvision/_api/appointments/' + id)
                                    .success(function (oldAppointment) {
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
                                        self.scope.selectedDoctor.drSurgery.events.push(oldAppointment);
                                    });
                                break;
                        }
                    }

                    hideFormSvc.hideForm();

                    if (self.scope.isNoShowReschedule == true) {
                        $location.path('/queue');

                    }
                })

                .error(function (data) {
                    console.log("Error with updating appointment");
                });

        };

    });