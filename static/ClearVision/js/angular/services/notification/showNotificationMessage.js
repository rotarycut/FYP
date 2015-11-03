angular.module('show.notifications', [])
    .service('showNotificationsSvc', function ($http, $rootScope, notify) {

        /* notification */

        this.notifySuccessTemplate = function (message) {

            var messageTemplate = '<span>' + message + '</span>';
            var successClass = "cg-notify-message";

            notify({
                messageTemplate: messageTemplate,
                scope: $rootScope,
                templateUrl: 'angular-notify.html',
                classes: successClass,
                position: 'center',
                duration: 3000
            });

            notify.closeAll();

        };

        this.notifyErrorTemplate = function (message) {

            var messageTemplate = '<span>' + message + '</span>';
            var warningClass = "cg-notify-message-warning";

            notify({
                messageTemplate: messageTemplate,
                scope: $rootScope,
                templateUrl: 'angular-notify.html',
                classes: warningClass,
                position: 'center',
                duration: 3000
            });

            notify.closeAll();

        };

        this.showNotifications = function () {

            $http.get('/Clearvision/_api/ViewNotifications/')
                .success(function (listOfNotifications) {
                    //console.log(listOfNotifications);

                    $rootScope.notificationList = listOfNotifications;
                    var notificationCount = 0;
                    angular.forEach($rootScope.notificationList, function (notification) {
                        if (notification.notified === false) {
                            notificationCount++;
                        }
                    });
                    //console.log(notificationCount);
                    $rootScope.notificationCount = notificationCount;
                    if (notificationCount >= 1) {
                        $rootScope.haveNotification = true;
                    }
                    //console.log($rootScope.notificationCount);
                })

        };

    });