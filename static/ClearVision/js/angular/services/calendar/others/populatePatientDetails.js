angular.module('populate.patients', [])
    .service('populatePatientsSvc', function ($http, $timeout, enableIScheduleSvc) {

        var self = this;
        self.scope = {};

        self.getScope = function (scope) {
            self.scope = scope;
        };


        /*******************************************************************************
         function to populate patient details upon selection on the edit appointment form
         *******************************************************************************/


        self.populatePatientDetails = function () {

            // determine selected patient in drop down
            var patientId = self.scope.fields.selectedPatient.id;

            // loop through the patient list and find the selected patient object
            angular.forEach(self.scope.fields.patientList, function (patient) {
                if (patientId === patient.id) {
                    self.scope.fields.patientName = patient.name;
                    self.scope.fields.patientContact = patient.contact;
                    self.scope.fields.marketingChannel = self.scope.listOfMarketingChannels[patient.marketingChannelId - 1];
                    self.scope.fields.patientId = patient.id;
                    self.scope.fields.originalPatientName = patient.name;
                    self.scope.fields.originalPatientContact = patient.contact;
                }
            });

            // api to get appointment remarks for the selected patient
            var url = '/Clearvision/_api/Remarks/?patient=' + self.scope.fields.patientId + '&appt=' + self.scope.fields.appointmentId;

            $http.get(url)
                .success(function (patientAppointment) {

                    // set the remarks field on the form
                    self.scope.fields.appointmentRemarks = patientAppointment.remarks;
                    self.scope.fields.originalAppointmentRemarks = patientAppointment.remarks;
                })

                .error(function () {

                    // log error in retrieving appointment remarks
                    console.log("Error getting patient's appointment remarks.");
                });

            // api to get wait list details for the selected patient
            var waitListUrl = '/Clearvision/_api/ViewWaitlistAppt/?appointmentId=' + self.scope.fields.appointmentId + '&patientId=' + self.scope.fields.patientId;

            $http.get(waitListUrl)
                .success(function (waitListAppointment) {

                    if (Object.keys(waitListAppointment).length == 0) {
                        self.scope.fields.waitingList = "False";
                        self.scope.showWaitingFields('no');
                        self.scope.form.disableFields.waitListCheckbox = true;
                    } else {
                        // patient has a wait list appointment
                        self.scope.fields.waitingList = "True";
                        self.scope.showWaitingFields('yes');
                        self.scope.form.disableFields.waitListCheckbox = true;
                        self.scope.form.disableFields.waitListTime = true;
                        self.scope.form.disableFields.waitListDateBtn = true;

                        self.scope.fields.waitingDate = waitListAppointment.date;
                        var waitingTime = self.scope.getFormattedTime(waitListAppointment.start);
                        var lastIndexOfColon = waitingTime.lastIndexOf(":");
                        waitingTime = waitingTime.substring(0, lastIndexOfColon);

                        // get appointment timings of wait list appointment
                        self.scope.getAppointmentTimings('', true);

                        $timeout(function () {
                            self.scope.fields.waitingTime = waitingTime.trim();
                        }, 2000);

                    }

                })
                .error(function () {
                    console.log("Error getting patient's waitlist appointment")
                });

            // show the form fields upon selection on the drop down menu
            for (var field in self.scope.form.showFields) {
                self.scope.form.showFields[field] = true;
            }

            // show the form buttons for edit form
            self.scope.form.showButtons['editForm'] = true;

            // enable iSchedule
            enableIScheduleSvc.enableISchedule();

        };

    });