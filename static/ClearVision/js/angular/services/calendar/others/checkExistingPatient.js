angular.module('check.existingPatient', [])
    .service('checkExistingPatientSvc', function ($http) {

        var self = this;
        self.scope = {};

        self.getScope = function (scope) {
            self.scope = scope;
        };


        /*******************************************************************************
         function which notifies of existing patient when typing contact number on form
         *******************************************************************************/


        self.checkExistingPatient = function (searchValue) {

            return $http.get('/Clearvision/_api/patients?search=' + searchValue)

                .then(function (response) {

                    var row = response.data;

                    // for both create and edit form, display a list of matching patients for the particular contact number
                    angular.forEach(row, function (patient) {

                        var rowStr = patient.name + ", " + patient.contact;
                        patient.str = rowStr;
                    });

                    // only for the create appointment form
                    if (self.scope.formTitle == "Create New Appointment") {

                        // if the contact number typed is no longer matching to that of the patient
                        if (response.data.length == 0) {

                            // no patient found for this contact number, clear patient name & marketing channel, enable marketing channel
                            self.scope.form.disableFields.marketingChannel = false;
                            self.scope.fields.patientName = "";
                            self.scope.fields.marketingChannel = "";
                        }

                    }

                    return row;

                });

        };

    });