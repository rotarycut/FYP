angular.module('clear.form', [])
    .service('clearFormSvc', function (disableIScheduleSvc) {

        var self = this;
        self._scope = {};

        self.getScope = function (scope) {
            self._scope = scope;
        };

        self.clearForm = function (scope) {

            if (self._scope.formTitle == "Create New Appointment") {
                disableIScheduleSvc.disableISchedule();
            }

            self._scope.fields = {};
            self._scope.appointmentForm.$setPristine();
            self._scope.appointmentForm.$setUntouched();
            self._scope.listOfAppointmentTimings = [];
            self._scope.disableSearchBox = false;

            // enable the marketing channel field, needed when marketing channel field is disabled after selecting an existing patient
            self._scope.form.disableFields.marketingChannel = false;
        };


        self.clearBlockForm = function () {

            self._scope.blockFields = {};
            self._scope.blockForm.$setPristine();
            self._scope.blockForm.$setUntouched();
        };

    });