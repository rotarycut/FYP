angular.module('get.marketingChannels', [])
    .service('getMarketingChannelsSvc', function ($http, $q) {


        /*******************************************************************************
         function to retrieve all marketing channels
         *******************************************************************************/


        this.getMarketingChannels = function () {

            var defer = $q.defer();

            $http.get('/Clearvision/_api/ViewAllMarketingChannels/')

                .success(function (listOfChannels) {

                    defer.resolve(listOfChannels);
                })

                .error(function () {
                    defer.reject("http get marketing channels failed");
                    console.log("Error getting marketing channels");
                });

            return defer.promise;
        };

    });