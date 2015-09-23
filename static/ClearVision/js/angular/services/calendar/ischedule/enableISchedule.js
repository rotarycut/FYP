var app = angular.module('enable.ISchedule', []);

app.service('enableIScheduleSvc', function () {

    var self = this;
    self.scope = {};

    self.getScope = function (scope) {
        self.scope = scope;

    };

    self.enableISchedule = function () {

        // do not enable iSchedule until both appointment type and doctor are selected
        if (self.scope.fields.appointmentType == undefined || self.scope.fields.doctorAssigned == undefined) {
            return;
        }

        self.scope.changeView('month', self.scope.selectedCalendar);

        /*
        if (self.scope.formTitle === 'Create New Appointment' || self.scope.iSchedule === true) {
            console.log("HEEEEE");
            console.log(self.scope.fields.appointmentDate);
            self.scope.getAppointmentTimings(self.scope.fields.appointmentType, '', self.scope.fields.doctorAssigned, 'monday', true);
        }
        */

        if (self.scope.formTitle === 'Create New Appointment' || self.scope.formTitle === 'Edit Appointment') {
            if (!self.scope.iSchedule) {
                self.scope.showHeatMap = true;
                self.scope.iSchedule = true;

                self.scope.removeEventSource(self.scope.doctorHoAppointments, self.scope.drHoScreenings);
                self.scope.removeEventSource(self.scope.doctorHoAppointments, self.scope.drHoPreEvaluations);
                self.scope.removeEventSource(self.scope.doctorHoAppointments, self.scope.drHoSurgeries);
                self.scope.removeEventSource(self.scope.doctorGohAppointments, self.scope.drGohScreenings);
                self.scope.removeEventSource(self.scope.doctorGohAppointments, self.scope.drGohPreEvaluations);
                self.scope.removeEventSource(self.scope.doctorGohAppointments, self.scope.drGohSurgeries);

                self.scope.getHeatMap(self.scope.fields.appointmentType, self.scope.fields.doctorAssigned);
                //self.scope.getISchedule();
                self.scope.showFilters = false;
            } else {
                self.scope.drHoLowHeatMap.events.splice(0);
                self.scope.drHoMedHeatMap.events.splice(0);
                self.scope.drHoHighHeatMap.events.splice(0);
                self.scope.drGohLowHeatMap.events.splice(0);
                self.scope.drGohMedHeatMap.events.splice(0);
                self.scope.drGohHighHeatMap.events.splice(0);
                self.scope.getHeatMap(self.scope.fields.appointmentType, self.scope.fields.doctorAssigned);
            }
        }
    }

});