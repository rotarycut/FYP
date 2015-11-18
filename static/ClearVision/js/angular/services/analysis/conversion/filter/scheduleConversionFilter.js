angular.module('schedule.conversionFilter', [])
    .service('scheduleConversionFilterSvc', function ($http, showNotificationsSvc) {

        var self = this;
        self.scope = {};

        self.getScope = function (scope) {
            self.scope = scope;
        };

        /* function to delete filter */
        self.deleteFilter = function (filterId) {

            $http.delete('/Clearvision/_api/EditSavedMarketingChannelCustomFilters/' + filterId)
                .success(function (data) {
                    self.scope.getSavedFilters();
                    showNotificationsSvc.notifySuccessTemplate('Filter deleted successfully');
                }).error(function (error) {
                    showNotificationsSvc.notifyErrorTemplate('Error deleting filter');
                });
        };

        /* function to update filter */
        self.editFilter = function (filterName) {

            if (self.scope.datepicker.toString().length >= 15 || self.scope.datepicker2.toString().length >= 15) {
                var startDate = self.scope.getFormattedDate(self.scope.datepicker);
                var endDate = self.scope.getFormattedDate(self.scope.datepicker2);
            } else {
                var startDate = self.scope.datepicker;
                var endDate = self.scope.datepicker2;
            }

            var listOfAppointmentId = self.scope.listOfSelectedChannelsId;

            var queryJson = {
                "customfilterID": self.scope.editFilterId,
                "startDate": startDate,
                "endDate": endDate,
                "name": filterName,
                "channelTypes": listOfAppointmentId
            };

            $http.post('/Clearvision/_api/EditSavedMarketingChannelCustomFilters/', queryJson)
                .success(function (data) {
                    self.scope.getSavedFilters();
                    showNotificationsSvc.notifySuccessTemplate('Filter updated successfully');

                }).error(function (error) {
                    showNotificationsSvc.notifyErrorTemplate('Error updating filter');
                });

        };

    });