var app = angular.module('add.archive', []);

app.service('addToArchiveSvc', function ($http) {

    var self = this;
    self._scope = {};

    self.getScope = function (scope) {
        self._scope = scope;
    };

    self.addToArchive = function (attendedAppointmentId, reasonId) {

        console.log({
            "attendedAppointmentId": attendedAppointmentId,
            "cancellationReasonID": reasonId
        });

        self._scope.postToArchive = {
            "attendedAppointmentId": attendedAppointmentId,
            "cancellationReasonID": reasonId
        };

        $http.post('/Clearvision/_api/ViewArchive/', self._scope.postToArchive)
            .success(function (result) {
                console.log("Added to archive successfully.")
                self._scope.getNoShow();
            });

    }

});