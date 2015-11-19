angular.module('show.form', [])
    .service('showFormSvc', function ($timeout) {

        var self = this;
        self.scope = {};

        self.getScope = function (scope) {
            self.scope = scope;
        };


        /*******************************************************************************
         function to show appointment form
         *******************************************************************************/


        self.showForm = function (formType) {

            // scale down the size of the calendar
            self.scope.scaleDownCalendar = true;
            self.scope.form.showButtons['addAndBlock'] = false;

            // show the progress bar
            self.scope.progressbar.start();
            self.scope.progressbar.complete();

            // show form only after 600ms
            $timeout(function () {
                self.scope.form.showForm = true;
            }, 600);

            // disabled both doctor's calendar tabs
            angular.forEach(self.scope.allDoctorsVariables, function (doctorCalendar) {
                doctorCalendar.disable = true;
            });

            // check whether the its a create or edit form
            if (formType === 'Create') {

                // perform these operations when showing the create appointment form
                self.scope.formTitle = "Create New Appointment";
                self.scope.showPatientList = false;
                self.scope.form.showButtons['createForm'] = true;
                self.scope.form.showSuggestedSlot = true;
                self.scope.form.showSuggestedSlot = true;

            } else if (formType === 'Edit') {

                // perform these operations when showing the edit appointment form
                self.scope.showPatientList = true;
                self.scope.formTitle = "Edit Appointment";


                for (var field in self.scope.form.showFields) {
                    self.scope.form.showFields[field] = false;
                }
                for (var field in self.scope.form.disableFields) {
                    self.scope.form.disableFields[field] = true;
                }
                for (var field in self.scope.form.showButtons) {
                    self.scope.form.showButtons[field] = false;
                }

            } else if (formType == 'EditOnePatient') {

                // perform these operations when editing an appointment with only 1 patient
                self.scope.showPatientList = true;
                self.scope.formTitle = "Edit Appointment";
                self.scope.form.showSuggestedSlot = false;

                for (var field in self.scope.form.showFields) {
                    self.scope.form.showFields[field] = true;
                }
                for (var field in self.scope.form.disableFields) {
                    self.scope.form.disableFields[field] = true;
                }
                for (var field in self.scope.form.showButtons) {
                    self.scope.form.showButtons[field] = false;
                }
                self.scope.form.showButtons['editForm'] = true;

            } else {
                // do nothing
            }

        };


        /*******************************************************************************
         function to show block form
         *******************************************************************************/

        /* blocker appointment time form */
        self.showBlockForm = function () {

            // scale down the size of the calendar
            self.scope.scaleDownCalendar = true;
            self.scope.form.showButtons['addAndBlock'] = false;

            // show the progress bar
            self.scope.progressbar.start();
            self.scope.progressbar.complete();

            // show form only after 600ms
            $timeout(function () {
                self.scope.form.showBlockForm = true;
            }, 600);

            // perform these operations when showing the create appointment form
            self.scope.formTitle = "Block Off Time";

        };

    });