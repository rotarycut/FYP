angular.module('edit.filter', [])
    .service('editFilterSvc', function ($http) {

        var self = this;
        self._scope = {};

        self.getScope = function (scope) {
            self._scope = scope;
        };

        self.editFilter = function (filterName) {

            var startDate = self._scope.getFormattedDate(self._scope.datepicker);
            var endDate = self._scope.getFormattedDate(self._scope.datepicker2);
            var listOfAppointmentId = self._scope.listOfSelectedAppointmentTypesId;


            var queryJson = {
                "customfilterID": self._scope.editFilterId,
                "startDate": startDate,
                "endDate": endDate,
                "name": filterName,
                "apptTypes": listOfAppointmentId
            };

            console.log(queryJson);

            $http.post('/Clearvision/_api/EditSavedApptTypeCustomFilters/', queryJson)
                .success(function (data) {
                    self._scope.getCustomFilters();
                })

        };
    });