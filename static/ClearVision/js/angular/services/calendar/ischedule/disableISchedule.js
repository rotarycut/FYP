var app = angular.module('disable.ISchedule', []);

app.service('disableIScheduleSvc', function ($timeout) {

    var self = this;
    self.scope = {};

    self.getScope = function (scope) {
        self.scope = scope;
    };


    /*******************************************************************************
     function to disable iSchedule
     *******************************************************************************/


    self.disableISchedule = function () {

        if ((self.scope.formTitle === 'Create New Appointment' || self.scope.formTitle === 'Edit Appointment') && self.scope.iSchedule === true) {

            self.scope.showHeatMap = false;
            self.scope.iSchedule = false;

            // remove all the low, medium, high heat map from the source array
            self.scope.addRemoveEventSource(self.scope.doctorHoAppointments, self.scope.tempLowHeatMap);
            self.scope.addRemoveEventSource(self.scope.doctorHoAppointments, self.scope.tempMedHeatMap);
            self.scope.addRemoveEventSource(self.scope.doctorHoAppointments, self.scope.tempHighHeatMap);

            $timeout(function () {

                // add all the appointments on the calendar
                self.scope.addEventSource(self.scope.doctorHoAppointments, self.scope.drHoScreenings);
                self.scope.addEventSource(self.scope.doctorHoAppointments, self.scope.drHoPreEvaluations);
                self.scope.addEventSource(self.scope.doctorHoAppointments, self.scope.drHoSurgeries);
                self.scope.addEventSource(self.scope.doctorGohAppointments, self.scope.drGohScreenings);
                self.scope.addEventSource(self.scope.doctorGohAppointments, self.scope.drGohPreEvaluations);
                self.scope.addEventSource(self.scope.doctorGohAppointments, self.scope.drGohSurgeries);

                // remove all the appointments in each of the low, medium and high heat map
                self.scope.tempLowHeatMap.events.splice(0);
                self.scope.tempMedHeatMap.events.splice(0);
                self.scope.tempHighHeatMap.events.splice(0);

            }, 2000);

            self.scope.showFilters = true;
        }
    }

});