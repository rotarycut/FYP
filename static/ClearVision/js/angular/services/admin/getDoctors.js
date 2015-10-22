angular.module('get.doctors', [])

    .service('getDoctorsService', function ($http, $q, $log) {

        /* function to get all doctors */
        this.getDoctors = function () {

            var defer = $q.defer();

            $http.get('/Clearvision/_api/doctors/')
                .success(function (listOfDoctors) {

                    defer.resolve(listOfDoctors);
                })

                .error(function (data) {
                    $log.error('Error retrieving doctors');
                });

            return defer.promise;

        };

    });