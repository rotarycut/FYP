angular.module('get.appointmentTypes', [])

    .service('getAppointmentTypesService', function ($http, $q, $log) {

        /* function to get all appointment types */
        this.getAppointmentTypes = function () {

            var defer = $q.defer();

            $http.get('/Clearvision/_api/ViewAllApptTypes/')
                .success(function (listOfAppointmentTypes) {

                    defer.resolve(listOfAppointmentTypes);
                })

                .error(function (data) {
                    $log.error('Error retrieving appointment types');
                });

            return defer.promise;

        };

    });