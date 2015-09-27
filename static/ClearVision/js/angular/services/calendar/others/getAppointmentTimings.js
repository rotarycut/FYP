angular.module('get.timings', [])
    .service('getApptTimingsSvc', function ($http) {

        var self = this;
        self.scope = {};

        self.getScope = function (scope) {
            self.scope = scope;
        };


        /*******************************************************************************
         function to get appointment timings
         *******************************************************************************/


        self.getAppointmentTimings = function (populateTiming, isWaitList) {

            // retrieve appointment form fields
            var apptType = self.scope.fields.appointmentType;
            var doctor = self.scope.fields.doctorAssigned;
            var date = self.scope.fields.appointmentDate;

            // check if it is getting the appointment timings from the wait list date
            if (isWaitList) {

                // set the date to the wait list date
                date = self.scope.fields.waitingDate;
            }


            // check if all the necessary fields are filled up
            if (apptType != undefined && doctor != undefined && date != undefined) {

                // all the necessary fields are filled up

                var d = new Date(date);

                var currentDay = new Date();
                var isCurrentDay;

                // check if it the date selected is the current date
                if (currentDay.toDateString() === d.toDateString()) {

                    isCurrentDay = "True";
                } else {

                    isCurrentDay = "False";
                }

                // assign the day to a day string
                switch (d.getDay()) {

                    case 0:

                        d = "Sunday";
                        break;

                    case 1:

                        d = "Monday";
                        break;

                    case 2:

                        d = "Tuesday";
                        break;

                    case 3:

                        d = "Wednesday";
                        break;

                    case 4:

                        d = "Thursday";
                        break;

                    case 5:

                        d = "Friday";
                        break;

                    case 6:

                        d = "Saturday";
                        break;

                }

                // make the call to get the appointment timings
                $http.get('/Clearvision/_api/ViewApptTimeslots/?apptType=' + apptType + '&docName=' + doctor + "&day=" + d + "&today=" + isCurrentDay)
                    .success(function (listOfTimings) {

                        // check if it is getting the appointment timings from the wait list date
                        if (isWaitList) {
                            self.scope.listOfWaitlistTimings = listOfTimings;

                        } else {
                            self.scope.listOfAppointmentTimings = listOfTimings;

                            if (populateTiming != undefined) {

                                self.scope.fields.appointmentTime = populateTiming;
                            } else {

                                // important to set this when editing form, changing from screening to surgery, must clear time from the previous scope that validation check will work
                                self.scope.fields.appointmentTime = '';
                            }

                        }

                    });

            }

        };

    });