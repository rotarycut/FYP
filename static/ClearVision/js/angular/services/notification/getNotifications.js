angular.module('get.notifications', [])
    .service('getNotificationsSvc', function ($http) {

        var self = this;
        self._scope = {};

        self.getScope = function (scope) {
            self._scope = scope;
        };

        self.getNotifications = function () {

            $http.get('/Clearvision/_api/ViewNotifications/')
                .success(function (listOfNotifications) {
                    //console.log(listOfNotifications);

                    self._scope.notificationList = listOfNotifications;
                    var notificationCount = 0;
                    angular.forEach(self._scope.notificationList, function (notification) {
                        if (notification.notified === false) {
                            notificationCount++;
                        }
                    });
                    //console.log(notificationCount);
                    self._scope.notificationCount = notificationCount;
                    if (notificationCount >= 1) {
                        self._scope.haveNotification = true;
                    }
                    //console.log(self._scope.notificationCount);
                })
        };

    });
