angular.module('update.notification.count', [])
    .service('updateNotificationCountSvc', function ($http) {

        var self = this;
        self._scope = {};

        self.getScope = function (scope) {
            self._scope = scope;
        };

        self.updateCount = function () {
            $http.post('/Clearvision/_api/ViewNotifications/')
                .success(function (emptyArr) {
                    self._scope.getNotifications();
                });
        };

    });