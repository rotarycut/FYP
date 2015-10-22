angular.module('get.clinics', [])

    .service('getClinicsService', function ($http, $q, $log) {

        /* function to get all doctors */
        this.getClinics = function () {

            var defer = $q.defer();

            $http.get('/Clearvision/_api/clinics/')
                .success(function (listOfClinics) {

                    defer.resolve(listOfClinics);
                })

                .error(function (data) {
                    $log.error('Error retrieving clinics');
                });

            return defer.promise;

        };

    });