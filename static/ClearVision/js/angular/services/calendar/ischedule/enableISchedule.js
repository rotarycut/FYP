var app = angular.module('enable.ISchedule', []);

app.service('enableIScheduleSvc', function () {

    var self = this;
    self._scope = {};

    self.getScope = function (scope) {
        self._scope = scope;

    };

    self.enableISchedule = function () {

        // do not enable iSchedule until both appointment type and doctor are selected
        if (self._scope.fields.appointmentType == undefined || self._scope.fields.doctorAssigned == undefined) {
            return;
        }

        self._scope.changeView('month', self._scope.selectedCalendar);

        console.log(self._scope.selectedCalendar);
        //console.log($scope.fields.doctorAssigned);
        //console.log($scope.fields.appointmentType);

        if (self._scope.formTitle === 'Create New Appointment' || self._scope.iSchedule === true) {
            self._scope.getAppointmentTimings(self._scope.fields.appointmentType, '', self._scope.fields.doctorAssigned);
        }

        if (self._scope.formTitle === 'Create New Appointment' || self._scope.formTitle === 'Edit Appointment') {
            if (!self._scope.iSchedule) {
                self._scope.showHeatMap = true;
                self._scope.iSchedule = true;
                self._scope.drHoScreenings.events.splice(0);
                self._scope.drHoPreEvaluations.events.splice(0);
                self._scope.drHoSurgeries.events.splice(0);
                self._scope.getHeatMap(self._scope.fields.appointmentType, self._scope.fields.doctorAssigned);
                self._scope.getISchedule();
                self._scope.showFilters = false;
            } else {
                self._scope.lowHeatMap.events.splice(0);
                self._scope.medHeatMap.events.splice(0);
                self._scope.highHeatMap.events.splice(0);
                self._scope.getHeatMap(self._scope.fields.appointmentType, self._scope.fields.doctorAssigned);
            }
        }
    }

});