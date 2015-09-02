var app = angular.module('get.noShow', []);

app.service('getNoShowSvc', function ($http) {

    var self = this;
    self._scope = {};

    self.getScope = function (scope) {
        self._scope = scope;
    };

    self.getNoShow = function () {

        $http.get('/Clearvision/_api/ViewNoShow/')
            .success(function (data) {
                self._scope.noShowList = data;
                console.log(self._scope.noShowList);
            });
    }

});