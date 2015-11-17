angular.module('edit.filter', [])
    .service('editFilterSvc', function ($http, showNotificationsSvc) {

        var self = this;
        self._scope = {};

        self.getScope = function (scope) {
            self._scope = scope;
        };

        self.editFilter = function (filterName) {

            if (self._scope.datepicker.toString().length >= 15 || self._scope.datepicker2.toString().length >= 15) {
                var startDate = self._scope.getFormattedDate(self._scope.datepicker);
                var endDate = self._scope.getFormattedDate(self._scope.datepicker2);
            } else {
                var startDate = self._scope.datepicker;
                var endDate = self._scope.datepicker2;
            }

            var listOfAppointmentId = self._scope.listOfSelectedAppointmentTypesId;

            var queryJson = {
                "customfilterID": self._scope.editFilterId,
                "startDate": startDate,
                "endDate": endDate,
                "name": filterName,
                "apptTypes": listOfAppointmentId
            };

            $http.post('/Clearvision/_api/EditSavedApptTypeCustomFilters/', queryJson)
                .success(function (data) {
                    self._scope.getCustomFilters();
                    showNotificationsSvc.notifySuccessTemplate('Filter updated successfully');

                }).error(function (error) {
                    showNotificationsSvc.notifyErrorTemplate('Error updating filter');
                });

        };
    });