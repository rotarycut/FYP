var app = angular.module('enable.ISchedule', []);

app.service('enableIScheduleSvc', function ($timeout) {

    var self = this;
    self.scope = {};

    self.getScope = function (scope) {
        self.scope = scope;
    };


    /*******************************************************************************
     function to enable iSchedule
     *******************************************************************************/


    self.enableISchedule = function () {

        // do not enable iSchedule until both appointment type and doctor are selected
        if (self.scope.fields.appointmentType == undefined || self.scope.fields.doctorAssigned == undefined) {
            return;
        }

        // change the calendar view to week view
        self.scope.changeView('agendaWeek', self.scope.selectedCalendar);

        if (self.scope.formTitle === 'Create New Appointment' || self.scope.formTitle === 'Edit Appointment') {

            // disable search box when iSchedule is enabled
            self.scope.disableSearchBox = true;

            // check if iSchedule is already enabled
            if (!self.scope.iSchedule) {

                // iSchedule is not previously enabled
                self.scope.showHeatMap = true;
                self.scope.iSchedule = true;

                // remove all the appointments on the calendar
                self.scope.removeEventSource(self.scope.doctorHoAppointments, self.scope.drHoScreenings);
                self.scope.removeEventSource(self.scope.doctorHoAppointments, self.scope.drHoPreEvaluations);
                self.scope.removeEventSource(self.scope.doctorHoAppointments, self.scope.drHoSurgeries);
                self.scope.removeEventSource(self.scope.doctorGohAppointments, self.scope.drGohScreenings);
                self.scope.removeEventSource(self.scope.doctorGohAppointments, self.scope.drGohPreEvaluations);
                self.scope.removeEventSource(self.scope.doctorGohAppointments, self.scope.drGohSurgeries);

                // get heat map for chosen appointment type and doctor
                self.scope.getHeatMap(self.scope.fields.appointmentType, self.scope.fields.doctorAssigned);
                //self.scope.getISchedule();
                self.scope.showFilters = false;

            } else {

                // iSchedule is already enabled

                // remove all the appointments in each of the low, medium and high heat map
                self.scope.tempLowHeatMap.events.splice(0, self.scope.tempLowHeatMap.events.length);
                self.scope.tempMedHeatMap.events.splice(0, self.scope.tempMedHeatMap.events.length);
                self.scope.tempHighHeatMap.events.splice(0, self.scope.tempHighHeatMap.events.length);

                // remove all the low, medium, high heat map from the source array
                self.scope.removeEventSource(self.scope.doctorHoAppointments, self.scope.tempLowHeatMap);
                self.scope.removeEventSource(self.scope.doctorHoAppointments, self.scope.tempMedHeatMap);
                self.scope.removeEventSource(self.scope.doctorHoAppointments, self.scope.tempHighHeatMap);
                self.scope.removeEventSource(self.scope.doctorGohAppointments, self.scope.tempLowHeatMap);
                self.scope.removeEventSource(self.scope.doctorGohAppointments, self.scope.tempMedHeatMap);
                self.scope.removeEventSource(self.scope.doctorGohAppointments, self.scope.tempHighHeatMap);

                // get heat map for chosen appointment type and doctor
                self.scope.getHeatMap(self.scope.fields.appointmentType, self.scope.fields.doctorAssigned);

            }
        }
    }
});