angular.module('populate.patients', [])
    .service('populatePatientsSvc', function ($http, enableIScheduleSvc) {

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
            var patientName = self.scope.fields.selectedPatient.name;

            // loop through the patient list and find the selected patient object
            angular.forEach(self.scope.fields.patientList, function (patient) {
                if (patientName === patient.name) {
                    self.scope.fields.patientName = patient.name;
                    self.scope.fields.patientContact = patient.contact;
                    self.scope.fields.marketingChannel = patient.marketingname;
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