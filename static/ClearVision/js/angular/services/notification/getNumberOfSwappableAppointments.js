angular.module('get.swappableAppointments', [])
    .service('getSwapApptsSvc', function ($http, $rootScope) {

        var self = this;

        self.getNumberOfSwappableAppointments = function () {

            $http.get('/Clearvision/_api/ViewSwappableNumber/')
                .success(function (numberOfSwappableAppointments) {

                    $rootScope.getNumberOfSwappableAppointments = numberOfSwappableAppointments;

                })
                .error(function (data) {

                });

        };

    });