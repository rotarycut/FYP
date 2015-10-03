angular.module('show.notifications', [])
    .service('showNotificationsSvc', function ($http, notify) {

        var self = this;
        self.scope = {};

        self.getScope = function (scope) {
            self.scope = scope;
        };

        /* notification */

        self.scope.template = 'angular-notify.html';

        self.scope.positions = ['center', 'left', 'right'];
        self.scope.position = self.scope.positions[0];

        self.scope.duration = 5000;

        self.scope.closeAll = function () {
            notify.closeAll();
        };

        self.notifySuccessTemplate = function () {

            var messageTemplate = '<span>Appointment created successfully!</span>';

            notify({
                messageTemplate: messageTemplate,
                classes: self.scope.classes,
                //classes: warningClass,
                scope: self.scope,
                templateUrl: self.scope.template,
                position: self.scope.position
            });

        };

        self.notifyErrorTemplate = function () {

            var messageTemplate = '<span>Time slots blocked!</span>';
            var warningClass = "cg-notify-message-warning";

            notify({
                messageTemplate: messageTemplate,
                //classes: self.scope.classes,
                classes: warningClass,
                scope: self.scope,
                templateUrl: self.scope.template,
                position: self.scope.position
            });

        };

        self.showNotifications = function () {

            $http.get('/Clearvision/_api/ViewNotifications/')
                .success(function (listOfNotifications) {
                    //console.log(listOfNotifications);

                    self.scope.notificationList = listOfNotifications;
                    var notificationCount = 0;
                    angular.forEach(self.scope.notificationList, function (notification) {
                        if (notification.notified === false) {
                            notificationCount++;
                        }
                    });
                    //console.log(notificationCount);
                    self.scope.notificationCount = notificationCount;
                    if (notificationCount >= 1) {
                        self.scope.haveNotification = true;
                    }
                    //console.log(self.scope.notificationCount);
                })
        };

    });
