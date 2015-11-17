angular.module('get.monthListings', [])
    .service('getMonthListingsSvc', function ($http, $q) {


        /*******************************************************************************
         function to retrieve all month listings
         *******************************************************************************/


        this.getMonthListings = function () {

            var defer = $q.defer();

            $http.get('/Clearvision/_api/ViewBacktrackListings/')

                .success(function (listOfMonths) {

                    defer.resolve(listOfMonths);
                })

                .error(function () {
                    defer.reject("http get month listings failed");
                });

            return defer.promise;
        };

    });