var app = angular.module('get.todayAppointments', []);

app.service('getTodayAppointmentSvc', function ($http) {

    var self = this;
    self.scope = {};

    self.getScope = function (scope) {
        self.scope = scope;
    };

    self.getTodayAppointments = function () {

        $http.get('/Clearvision/_api/ViewTodayPatients/')
            .success(function (data) {

                self.scope.patientList = data;

                angular.forEach(self.scope.patientList, function (patient) {

                    if (patient.associatedpatientactions__addedToQueue == false || patient.associatedpatientactions__addedToQueue == true) {
                        patient.disableButtons = true;
                    }
                    else {
                        patient.disableButtons = false;
                    }
                });

            });

    }
});