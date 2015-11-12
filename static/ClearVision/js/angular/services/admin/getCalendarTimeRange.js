angular.module('get.calendarTimeRange', [])

    .service('getCalendarTimeRangeService', function ($http, $q, $log) {

        /* function to get calendar time range */
        this.getCalendarTimeRange = function () {

            var defer = $q.defer();

            $http.get('/Clearvision/_api/ViewCalendarTimeRange/')
                .success(function (calendarTimeRange) {

                    defer.resolve(calendarTimeRange);
                })

                .error(function (data) {
                    $log.error('Error retrieving calendar time range');
                });

            return defer.promise;

        };

    });