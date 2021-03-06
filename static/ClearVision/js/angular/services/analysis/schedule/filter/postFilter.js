angular.module('post.filter', [])
    .service('postFilterSvc', function ($http, showNotificationsSvc) {

        var self = this;
        self._scope = {};

        self.getScope = function (scope) {
            self._scope = scope;
        };

        self.postFilter = function (filterName) {

            if (self._scope.datepicker.toString().length >= 15 || self._scope.datepicker2.toString().length >= 15) {
                var startDate = self._scope.getFormattedDate(self._scope.datepicker);
                var endDate = self._scope.getFormattedDate(self._scope.datepicker2);
            } else {
                var startDate = self._scope.datepicker;
                var endDate = self._scope.datepicker2;
            }

            var listOfAppointmentId = self._scope.listOfSelectedAppointmentTypesId;

            var queryJson = {
                "name": filterName,
                "startDate": startDate,
                "endDate": endDate,
                "apptTypes": listOfAppointmentId
            };

            console.log(queryJson);

            $http.post('/Clearvision/_api/ViewSavedApptTypeCustomFilters/', queryJson)
                .success(function (data) {
                    self._scope.getCustomFilters();
                    showNotificationsSvc.notifySuccessTemplate('Filter saved successfully');

                }).error(function (error) {
                    showNotificationsSvc.notifyErrorTemplate('Error saving filter');
                });

        };
    });