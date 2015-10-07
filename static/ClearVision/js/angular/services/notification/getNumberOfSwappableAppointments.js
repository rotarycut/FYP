angular.module('get.swappableAppointments', [])
    .service('getSwapApptsSvc', function ($http) {

        var self = this;
        self.scope = {};

        self.getScope = function (scope) {
            self.scope = scope;
        };

        self.getNumberOfSwappableAppointments = function () {

            $http.get('/Clearvision/_api/ViewSwappableNumber/')
                .success(function (data) {
                    self.scope.noOfSwappableAppts = data;

                    console.log(data);
                })
                .error(function (data) {

                });
        };

    });