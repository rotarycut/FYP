var app = angular.module('add.archive', []);

app.service('addToArchiveSvc', function ($http, showNotificationsSvc) {

    var self = this;
    self._scope = {};

    self.getScope = function (scope) {
        self._scope = scope;
    };

    self.addToArchive = function (attendedAppointmentId, reasonId) {

        self._scope.postToArchive = {
            "attendedAppointmentId": attendedAppointmentId,
            "cancellationReasonID": reasonId
        };

        $http.post('/Clearvision/_api/ViewArchive/', self._scope.postToArchive)
            .success(function () {
                showNotificationsSvc.notifySuccessTemplate('Added to archive successfully');
                self._scope.getNoShow();
            });

    };

});