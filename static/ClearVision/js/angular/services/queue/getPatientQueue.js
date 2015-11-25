var app = angular.module('get.patientQueue', []);

app.service('getPatientQueueSvc', function ($http) {

    var self = this;
    self.scope = {};

    self.getScope = function (scope) {
        self.scope = scope;
    };

    self.getPatientQueue = function () {

        $http.get('/Clearvision/_api/ViewPatientQueue/')
            .success(function (data) {

                angular.forEach(data, function (appt) {

                    var indexOfT = appt.last_modified.indexOf("T") + 1;
                    var indexOfLastColon = appt.last_modified.lastIndexOf(":");
                    appt.last_modified = appt.last_modified.substring(indexOfT, indexOfLastColon);

                });

                self.scope.queueList = data;
            });

    };
});