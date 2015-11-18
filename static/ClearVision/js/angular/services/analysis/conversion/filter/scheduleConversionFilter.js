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

    });