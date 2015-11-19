angular.module('get.marketingChannelsStatus', [])
    .service('getMarketingChannelsStatusSvc', function ($http, $q) {


        /*******************************************************************************
         function to retrieve all marketing channels
         *******************************************************************************/


        this.getMarketingChannelsStatus = function () {

            var defer = $q.defer();

            $http.get('/Clearvision/_api/EditMarketingChannelsStatus/')

                .success(function (listOfChannels) {

                    defer.resolve(listOfChannels);
                })

                .error(function () {
                    defer.reject("http get marketing channels status failed");
                    console.log("Error getting marketing channels status");
                });

            return defer.promise;
        };

    });