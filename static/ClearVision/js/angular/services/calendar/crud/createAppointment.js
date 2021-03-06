angular.module('post.appointment', [])
    .service('postAppointmentSvc', function ($http, $log, $filter, $rootScope, disableIScheduleSvc, clearFormSvc,
                                             showNotificationsSvc, getSwapApptsSvc) {

        var self = this;
        self.scope = {};

        self.getScope = function (scope) {
            self.scope = scope;
        };

        /*******************************************************************************
         function to post appointment
         *******************************************************************************/

        self.postAppointment = function () {

            $rootScope.spinner = {active: true};

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

            if (self.scope.fields.smsOptOut === undefined) {
                self.scope.fields.smsOptOut = false;
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
                    "gender": "Female",
                    "channelID": self.scope.fields.marketingChannel.id.toString(),
                    "time": self.scope.fields.appointmentTime,
                    "remarks": self.scope.fields.appointmentRemarks,
                    "waitingListFlag": self.scope.fields.waitingList,
                    "tempDate": self.scope.fields.waitingDate,
                    "tempTime": self.scope.fields.waitingTime,
                    "socketId": $rootScope.socketId,
                    "smsOptOut": self.scope.fields.smsOptOut
                }
            };

            $http(req)
                .success(function (appointment) {

                    $rootScope.spinner = {active: false};

                    showNotificationsSvc.notifySuccessTemplate('Appointment created successfully');

                    // disable iSchedule
                    disableIScheduleSvc.disableISchedule();

                    // change view back to month view, this will retrieve the doctor appointments
                    self.scope.changeView('month', self.scope.chosenDoctor.changeCalendar);

                    // clear the appointment form
                    clearFormSvc.clearForm();

                    // get number of swappable appointments
                    getSwapApptsSvc.getNumberOfSwappableAppointments();

                    // check the appointment type of the created appointment
                    /*
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
                     }*/

                }).error(function (error) {

                    $rootScope.spinner = {active: false};
                    showNotificationsSvc.notifyErrorTemplate('Error creating appointment');
                    $log.error("Error creating appointment");
                });

        };
    });