angular.module('post.roiFilter', [])
    .service('postRoiFilterSvc', function ($http, showNotificationsSvc) {

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

            var listOfChannelId = self._scope.listOfSelectedChannelsId;

            var queryJson = {
                "name": filterName,
                "startDate": startDate,
                "endDate": endDate,
                "channelTypes": listOfChannelId
            };

            $http.post('/Clearvision/_api/ViewSavedMarketingChannelCustomFilters/', queryJson)
                .success(function (data) {
                    self._scope.getSavedFilters();
                    showNotificationsSvc.notifySuccessTemplate('Filter saved successfully');

                }).error(function (error) {
                    showNotificationsSvc.notifyErrorTemplate('Error saving filter');
                })
        };
    });
