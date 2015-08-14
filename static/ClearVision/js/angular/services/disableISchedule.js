var app = angular.module('disable.ISchedule', []);

app.service('disableIScheduleSvc', function () {

    var self = this;
    self._scope = {};

    self.getScope = function (scope) {
        self._scope = scope;

    };

    self.disableISchedule = function () {

        if (self._scope.formTitle === 'Create New Appointment' && self._scope.iSchedule === true) {
            self._scope.showHeatMap = false;
            self._scope.iSchedule = false;
            self._scope.lowHeatMap.events.splice(0);
            self._scope.medHeatMap.events.splice(0);
            self._scope.highHeatMap.events.splice(0);
            self._scope.getDrHoScreenings();
            self._scope.getDrHoPreEvaluations();
            self._scope.getDrHoSurgeries();
        }
    }

});