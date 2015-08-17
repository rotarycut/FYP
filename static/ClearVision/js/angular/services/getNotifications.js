angular.module('get.notifications', [])
    .service('getNotificationsSvc', function ($http) {

        var self = this;
        self._scope = {};

        self.getScope = function (scope) {
            self._scope = scope;
        };

        self.getNotifications = function () {
            console.log("COMING TO NOTIFICATION");
            $http.get('/Clearvision/_api/ViewNotifications/')
                .success(function (listOfNotifications) {
                    console.log(listOfNotifications);

                    self._scope.notificationList = listOfNotifications;
                    var notificationCount = 0;
                    angular.forEach(self._scope.notificationList, function (notification) {
                        if (notification.notified === false) {
                            notificationCount++;
                        }
                    });
                    console.log(notificationCount);
                    self._scope.notificationCount = notificationCount;
                    console.log(self._scope.notificationCount);
                })
        };

    });