angular.module('post.roiFilter', [])
    .service('postRoiFilterSvc', function ($http) {

        var self = this;
        self._scope = {};

        self.getScope = function (scope) {
            self._scope = scope;
        };

        self.postFilter = function (filterName) {

            var startDate = self._scope.getFormattedDate(self._scope.datepicker);
            var endDate = self._scope.getFormattedDate(self._scope.datepicker2);
            var listOfChannelId = self._scope.listOfSelectedChannelsId;

            var queryJson = {
                "name": filterName,
                "startDate": startDate,
                "endDate": endDate,
                "channels": listOfChannelId
            };

            console.log(queryJson);

            /*$http.post('/Clearvision/_api/ViewSavedApptTypeCustomFilters/', queryJson)
             .success(function (data) {
             self._scope.getCustomFilters();
             })*/
        };
    });