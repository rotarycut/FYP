angular.module('post.blocker', [])
    .service('postBlockerSvc', function ($http, $log, disableIScheduleSvc, clearFormSvc) {
        var self = this;
        self.scope = {};

        self.getScope = function (scope) {
            self.scope = scope;
        };

        /* temp for blocker form */
        self.postBlockTimeSlots = function () {

            $http.post('/Clearvision/_api/CalendarBlocker/', {
                "remarks": self.scope.fields.blockFormRemarks,
                "startDate": self.scope.fields.blockDateStart,
                "startTime": self.scope.fields.blockTimeStart,
                "endDate": self.scope.fields.blockDateEnd,
                "endTime": self.scope.fields.blockTimeEnd,
                "doctor": self.scope.fields.doctorToBlock,
            })
                .success(function (data) {
                    $scope.message = data;
                    console.log("Success with blocker creation")

                })

                .error(function (data) {
                    console.log("Error with http post");
                });

        };
    });
