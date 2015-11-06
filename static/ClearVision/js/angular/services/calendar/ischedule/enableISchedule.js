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

        // disable appointment type and doctor field to be changed while loading heat map & back button
        self.scope.form.disableFields.disabledApptType = true;
        self.scope.form.disableFields.doctor = true;
        self.scope.form.backBtn = true;

        // change the calendar view to week view
        self.scope.changeView('agendaWeek', self.scope.chosenDoctor.changeCalendar);

        // navigate the calendar to current date once heat map is enabled
        /*if (self.scope.selectedCalendar == 'myCalendar1') {

         $('#drHoCalendar').fullCalendar('gotoDate', new Date());
         } else {

         $('#drGohCalendar').fullCalendar('gotoDate', new Date());
         }*/

        if (self.scope.formTitle === 'Create New Appointment' || self.scope.formTitle === 'Edit Appointment') {

            // disable search box when iSchedule is enabled
            self.scope.disableSearchBox = true;

            // check if iSchedule is already enabled
            if (!self.scope.iSchedule) {

                console.log("HERE");
                console.log(self.scope.chosenDoctor.doctorAppointmentSource);

                //self.scope.removeEventSource(self.scope.chosenDoctor.DrHoappointments, self.scope.DrHoPreEvaluation);
                //self.scope.removeEventSource(self.scope.chosenDoctor.DrHoappointments, self.scope.DrHoSurgery);
                //self.scope.removeEventSource(self.scope.chosenDoctor.DrHoappointments, self.scope.DrHoPostSurgery);

                self.scope.removeFromDoctorSource(
                    self.scope.chosenDoctor.doctorAppointmentSource,
                    self.scope.chosenDoctor.appointmentTypeSourceArray,
                    true
                );

                //var arr = ['DrHoPreEvaluation', 'DrHoSurgery', 'DrHoPostSurgery'];
                //self.scope.removeFromDoctorSource(self.scope.chosenDoctor.DrHoappointments, arr, true);
                //console.log(self.scope.DrHoappointments);

                console.log(self.scope.chosenDoctor.doctorAppointmentSource);
                //self.scope.chosenDoctor.ap

                // iSchedule is not previously enabled
                self.scope.showHeatMap = true;
                self.scope.iSchedule = true;

                // remove all the appointments on the calendar
                /*self.scope.removeFromDoctorSource(
                    self.scope.chosenDoctor.doctorAppointmentSource,
                    self.scope.chosenDoctor.appointmentTypeSourceArray,
                    true
                );*/

                // get heat map for chosen appointment type and doctor
                self.scope.getHeatMap(self.scope.fields.appointmentType.name, self.scope.fields.doctorAssigned.id);

                //self.scope.getISchedule();
                self.scope.showFilters = false;

            } else {

                // iSchedule is already enabled

                // remove all the appointments in each of the low, medium and high heat map
                self.scope.tempLowHeatMap.events.splice(0, self.scope.tempLowHeatMap.events.length);
                self.scope.tempMedHeatMap.events.splice(0, self.scope.tempMedHeatMap.events.length);
                self.scope.tempHighHeatMap.events.splice(0, self.scope.tempHighHeatMap.events.length);
                self.scope.blockedHeatMap.events.splice(0, self.scope.blockedHeatMap.events.length);

                // remove all the low, medium, high heat map from the source array
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

                // get heat map for chosen appointment type and doctor
                self.scope.getHeatMap(self.scope.fields.appointmentType.name, self.scope.fields.doctorAssigned.id);

            }
        }
    }
});