var app = angular.module('disable.ISchedule', []);

app.service('disableIScheduleSvc', function ($timeout) {

    var self = this;
    self.scope = {};

    self.getScope = function (scope) {
        self.scope = scope;

    };

    self.disableISchedule = function () {

        if ((self.scope.formTitle === 'Create New Appointment' || self.scope.formTitle === 'Edit Appointment') && self.scope.iSchedule === true) {
            self.scope.showHeatMap = false;
            self.scope.iSchedule = false;

            //self.scope.removeEventSource(self.scope.doctorHoAppointments, self.scope.drHoLowHeatMap);
            self.scope.drHoLowHeatMap.events.splice(0);
            self.scope.drHoMedHeatMap.events.splice(0);
            self.scope.drHoHighHeatMap.events.splice(0);
            self.scope.drGohLowHeatMap.events.splice(0);
            self.scope.drGohMedHeatMap.events.splice(0);
            self.scope.drGohHighHeatMap.events.splice(0);

            $timeout(function () {
                self.scope.addEventSource(self.scope.doctorHoAppointments, self.scope.drHoScreenings);
                self.scope.addEventSource(self.scope.doctorHoAppointments, self.scope.drHoPreEvaluations);
                self.scope.addEventSource(self.scope.doctorHoAppointments, self.scope.drHoSurgeries);
                self.scope.addEventSource(self.scope.doctorGohAppointments, self.scope.drGohScreenings);
                self.scope.addEventSource(self.scope.doctorGohAppointments, self.scope.drGohPreEvaluations);
                self.scope.addEventSource(self.scope.doctorGohAppointments, self.scope.drGohSurgeries);
            }, 2000);

            self.scope.showFilters = true;
        }
    }

});