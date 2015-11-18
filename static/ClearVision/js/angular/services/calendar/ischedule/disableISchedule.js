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

            self.scope.removeEventSource(self.scope.DrHoappointments, self.scope.tempLowHeatMap);
            self.scope.removeEventSource(self.scope.DrHoappointments, self.scope.tempMedHeatMap);
            self.scope.removeEventSource(self.scope.DrHoappointments, self.scope.tempHighHeatMap);
            self.scope.removeEventSource(self.scope.DrHoappointments, self.scope.blockedHeatMap);
            self.scope.removeEventSource(self.scope.DrGohappointments, self.scope.tempLowHeatMap);
            self.scope.removeEventSource(self.scope.DrGohappointments, self.scope.tempMedHeatMap);
            self.scope.removeEventSource(self.scope.DrGohappointments, self.scope.tempHighHeatMap);
            self.scope.removeEventSource(self.scope.DrGohappointments, self.scope.blockedHeatMap);
            self.scope.removeEventSource(self.scope.Optometristappointments, self.scope.tempLowHeatMap);
            self.scope.removeEventSource(self.scope.Optometristappointments, self.scope.tempMedHeatMap);
            self.scope.removeEventSource(self.scope.Optometristappointments, self.scope.tempHighHeatMap);
            self.scope.removeEventSource(self.scope.Optometristappointments, self.scope.blockedHeatMap);

            $timeout(function () {

                // remove all the appointments in each of the low, medium and high heat map
                self.scope.tempLowHeatMap.events.splice(0, self.scope.tempLowHeatMap.events.length);
                self.scope.tempMedHeatMap.events.splice(0, self.scope.tempMedHeatMap.events.length);
                self.scope.tempHighHeatMap.events.splice(0, self.scope.tempHighHeatMap.events.length);
                self.scope.blockedHeatMap.events.splice(0, self.scope.blockedHeatMap.events.length);

                // add all the appointments on the calendar
                /*self.scope.addEventSource(self.scope.doctorHoAppointments, self.scope.drHoPreEvaluations);
                 self.scope.addEventSource(self.scope.doctorHoAppointments, self.scope.drHoSurgeries);
                 self.scope.addEventSource(self.scope.doctorHoAppointments, self.scope.drHoPostSurgeries);
                 self.scope.addEventSource(self.scope.doctorGohAppointments, self.scope.drGohPreEvaluations);
                 self.scope.addEventSource(self.scope.doctorGohAppointments, self.scope.drGohSurgeries);
                 self.scope.addEventSource(self.scope.doctorGohAppointments, self.scope.drGohPostSurgeries);
                 self.scope.addEventSource(self.scope.optomAppointments, self.scope.optomScreenings);
                 self.scope.addEventSource(self.scope.optomAppointments, self.scope.optomEyeCare);*/

                // yet to get back appointments


            }, 1000);

            self.scope.showFilters = true;
        }
    }

});