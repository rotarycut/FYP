angular.module('editRoi.filter', [])
    .service('editRoiFilterSvc', function ($http, showNotificationsSvc) {

        var self = this;
        self._scope = {};

        self.getScope = function (scope) {
            self._scope = scope;
        };

        self.editRoiFilter = function (filterName) {

            var listOfAppointmentId = self._scope.listOfSelectedChannelsId;

            var queryJson = {
                "customfilterID": self._scope.editFilterId,
                "name": filterName,
                "channelTypes": listOfAppointmentId
            };

            $http.post('/Clearvision/_api/EditSavedROICustomFilters/', queryJson)
                .success(function (data) {
                    self._scope.getCustomFilters();
                    showNotificationsSvc.notifySuccessTemplate('Filter updated successfully');

                }).error(function (error) {
                    showNotificationsSvc.notifyErrorTemplate('Error updating filter');
                });

        };
    });