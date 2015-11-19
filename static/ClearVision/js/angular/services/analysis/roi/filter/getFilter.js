angular.module('get.roiFilter', [])
    .service('getRoiFilterSvc', function ($http) {

        var self = this;
        self.scope = {};

        self.getScope = function (scope) {
            self.scope = scope;
        };

        /* function to get custom filter */
        self.getCustomFilters = function () {

            $http.get('/Clearvision/_api/ViewSavedROICustomFilters/')
                .success(function (data) {
                    self.scope.savedFilters = data;
                })
        };

    });
