angular.module('appointment.service', [])

    .service('appointmentService', function ($http, $q, $timeout, $log) {

        /* function to get appointments for respective doctor and appointment types */
        this.getDoctorAppointments = function (doctorId, appointmentTypeArray, startDate, endDate) {

            var promises = [];

            angular.forEach(appointmentTypeArray, function (appointmentType) {

                promises.push($http.get('/Clearvision/_api/appointments/?startDate=' + startDate + '&endDate=' + endDate + '&doctor=' + doctorId + '&apptType=' + appointmentType)
                        .success(function (listOfAppointments) {

                            return listOfAppointments;
                        })

                        .error(function () {

                            $log.error("Error getting " + doctor + " appointments");
                        })
                );
            });

            return $q.all(promises);

        };


        /*

         // function to retrieve dr goh's appointments
         this.getDrGohAppointments = function () {
         var promises = [this.getDrGohPreEvaluations(), this.getDrGohSurgeries(), this.getDrGohPostSurgeries()];
         return $q.all(promises);
         };

         // function to retrieve dr goh's pre-evaluation appointments
         this.getDrGohPreEvaluations = function () {

         var defer = $q.defer();

         $http.get('/Clearvision/_api/appointments/?doctor__name=Dr%20Goh&apptType=Pre%20Evaluation')

         .success(function (listOfAppointments) {
         $timeout(function () {
         var drGohPreEvaluations = listOfAppointments;
         defer.resolve(drGohPreEvaluations);
         }, 100);
         })

         .error(function () {
         defer.reject("http get failed");
         console.log("Error getting Dr Goh's pre-evaluation appointments");
         });

         return defer.promise;
         };

         */

    });