var app = angular.module('disable.ISchedule', []);

app.service('disableIScheduleSvc', function () {

    var self = this;
    self._scope = {};

    self.getScope = function (scope) {
        self._scope = scope;

    };

    self.disableISchedule = function () {

        if ((self._scope.formTitle === 'Create New Appointment' || self._scope.formTitle === 'Edit Appointment') && self._scope.iSchedule === true) {
            self._scope.showHeatMap = false;
            self._scope.iSchedule = false;
            self._scope.drHoLowHeatMap.events.splice(0);
            self._scope.drHoMedHeatMap.events.splice(0);
            self._scope.drHoHighHeatMap.events.splice(0);
            self._scope.drGohLowHeatMap.events.splice(0);
            self._scope.drGohMedHeatMap.events.splice(0);
            self._scope.drGohHighHeatMap.events.splice(0);
            self._scope.getDrHoScreenings();
            self._scope.getDrHoPreEvaluations();
            self._scope.getDrHoSurgeries();
            self._scope.getDrGohScreenings();
            self._scope.getDrGohPreEvaluations();
            self._scope.getDrGohSurgeries();
            self._scope.showFilters = true;
        }
    }

});