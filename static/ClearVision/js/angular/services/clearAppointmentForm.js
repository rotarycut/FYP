angular.module('clear.form', [])
    .service('clearFormSvc', function () {

        var self = this;
        self._scope = {};

        self.getScope = function (scope) {
            self._scope = scope;
        };

        self.clearForm = function (scope) {
            self._scope.fields = {};
            self._scope.appointmentForm.$setPristine();
            self._scope.appointmentForm.$setUntouched();
        };

    });