angular.module('get.appointmentTypesColor', [])

    .service('getAppointmentTypesColorService', function ($http, $q, $log) {

        /* function to get all doctors */
        this.getAppointmentTypesColor = function () {

            var defer = $q.defer();

            $http.get('/Clearvision/_api/ViewCalendarColorSettings/')
                .success(function (listOfAppointmentTypesColor) {

                    defer.resolve(listOfAppointmentTypesColor);
                })

                .error(function (data) {
                    $log.error('Error retrieving appointment types color');
                });

            return defer.promise;

        };

    });