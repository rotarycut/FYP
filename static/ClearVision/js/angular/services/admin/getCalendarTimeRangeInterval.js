angular.module('get.calendarTimeRangeInterval', [])

    .service('getCalendarTimeRangeIntervalService', function ($http, $q, $log, getCalendarTimeRangeService) {

        /* function to get calendar time range interval */
        this.getCalendarTimeRangeInterval = function () {

            var defer = $q.defer();

            getCalendarTimeRangeService.getCalendarTimeRange()
                .then(function (calendarTimeObject) {

                    // by default always getting the start end time of the first and only clinic
                    var startTime = calendarTimeObject[0].startTime;
                    var endTime = calendarTimeObject[0].endTime;

                    var startHour = parseInt(startTime.substring(0, startTime.indexOf(":")));
                    var endHour = parseInt(endTime.substring(0, endTime.indexOf(":")));

                    var startMin = startTime.substring(startTime.indexOf(":") + 1, startTime.lastIndexOf(":"));
                    var endMin = endTime.substring(endTime.indexOf(":") + 1, endTime.lastIndexOf(":"));

                    // prepare the calendar time slot array
                    var timeSlotsArray = [];

                    // loop through from the start hour to the end hour
                    for (i = startHour; i <= endHour; i++) {

                        if (i === startHour && startMin === "30") {

                            if (i < 10) {
                                i = "0" + i;
                            }
                            timeSlotsArray.push(i + ":30");

                        } else if (i === endHour && endMin === "00") {
                            // do not add appointment since last time slot must be 30 minutes before closing time

                        } else if (i === endHour && endMin === "30") {

                            if (i < 10) {
                                i = "0" + i;
                            }
                            timeSlotsArray.push(i + ":00");

                        } else {

                            if (i < 10) {
                                i = "0" + i;
                            }
                            timeSlotsArray.push(i + ":00");
                            timeSlotsArray.push(i + ":30");
                        }
                    }


                    defer.resolve(timeSlotsArray);


                }, function (error) {

                    $log("Error getting calendar time range interval");
                });

            return defer.promise;

        }

    });