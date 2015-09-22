angular.module('update.appointment', [])
    .service('updateAppointmentSvc', function ($http, $location, hideFormSvc) {

        var self = this;
        self.scope = {};

        self.getScope = function (scope) {
            self.scope = scope;
        };


        /*******************************************************************************
         function to update appointment
         *******************************************************************************/


        self.updateAppointment = function (updateObject, isFromSocket) {

            // check if it is a call from the socket
            if (isFromSocket) {


            } else {

                // the call is NOT from the socket

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

                var req = {
                    method: 'PATCH',
                    url: '/Clearvision/_api/appointmentsCUD/' + self.scope.fields.appointmentId,
                    headers: {'Content-Type': 'application/json'},
                    data: updateJson
                };

                $http(req)
                    .success(function (data) {

                        console.log("Successfully updated");

                        // handle the update of the newly changed appointment

                        // check the appointment type of the newly changed appointment
                        switch (self.scope.fields.appointmentType) {

                            case "Screening":

                                // remove the entire newly changed appointment from the calendar
                                self.scope.spliceAppointment(self.scope.selectedDoctor.drScreening.events, data.id);

                                // add the updated newly changed appointment to the calendar
                                self.scope.selectedDoctor.drScreening.events.push(data);
                                break;

                            case "Pre Evaluation":

                                self.scope.spliceAppointment(self.scope.selectedDoctor.drPreEval.events, data.id);
                                self.scope.selectedDoctor.drPreEval.events.push(data);
                                break;

                            case "Surgery":

                                self.scope.spliceAppointment(self.scope.selectedDoctor.drSurgery.events, data.id);
                                self.scope.selectedDoctor.drSurgery.events.push(data);
                                break;
                        }

                        // handle the update of the old appointment
                        var id = self.scope.fields.appointmentId;

                        // check the appointment type of the old appointment
                        switch (self.scope.fields.originalAppointmentType) {

                            case "Screening":

                                // remove the entire old appointment from the calendar
                                self.scope.spliceAppointment(self.scope.selectedDoctor.drScreening.events, id);

                                // check if the appointment still has patients after shifting a patient out
                                $http.get('/Clearvision/_api/appointments/' + id)
                                    .success(function (oldAppointment) {

                                        // there are still patients, add the updated old appointment back to the calendar
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

                        // hide the appointment form
                        hideFormSvc.hideForm();

                        // if the update is coming from the no show reschedule action
                        if (self.scope.isNoShowReschedule == true) {
                            $location.path('/queue');
                        }

                    })

                    .error(function (data) {
                        console.log("Error with updating appointment");
                    });

            }

        };

    });