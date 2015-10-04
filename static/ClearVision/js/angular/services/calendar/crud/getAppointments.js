angular.module('appointment.service', [])
    .service('appointmentService', function ($http, $q, $timeout) {

        /* function to retrieve dr ho's appointments */
        this.getDrHoAppointments = function () {
            var promises = [this.getDrHoPreEvaluations(), this.getDrHoSurgeries(), this.getDrHoPostSurgeries()];
            return $q.all(promises);
        };

        /* function to retrieve dr goh's appointments */
        this.getDrGohAppointments = function () {
            var promises = [this.getDrGohPreEvaluations(), this.getDrGohSurgeries(), this.getDrGohPostSurgeries()];
            return $q.all(promises);
        };

        /* function to  retrieve optom's appointments */
        this.getOptomAppointments = function () {
            var promises = [this.getOptomScreenings(), this.getOptomEyeCare()];
            return $q.all(promises);
        };

        /* function to retrieve dr ho's screening appointments */
        this.getDrHoPostSurgeries = function () {

            var defer = $q.defer();

            $http.get('/Clearvision/_api/appointments/?doctor__name=Dr%20Ho&apptType=Post%20Surgery')

                .success(function (listOfAppointments) {
                    $timeout(function () {
                        var drHoPostSurgeries = listOfAppointments;
                        defer.resolve(drHoPostSurgeries);
                    }, 100);
                })

                .error(function () {
                    defer.reject("http get failed");
                    console.log("Error getting Dr Ho's post surgeries appointments");
                });

            return defer.promise;
        };

        /* function to retrieve dr ho's pre-evaluation appointments */
        this.getDrHoPreEvaluations = function () {

            var defer = $q.defer();

            $http.get('/Clearvision/_api/appointments/?doctor__name=Dr%20Ho&apptType=Pre%20Evaluation')

                .success(function (listOfAppointments) {
                    $timeout(function () {
                        var drHoPreEvaluations = listOfAppointments;
                        defer.resolve(drHoPreEvaluations);
                    }, 100);
                })

                .error(function () {
                    defer.reject("http get failed");
                    console.log("Error getting Dr Ho's pre-evaluation appointments");
                });

            return defer.promise;
        };

        /* function to retrieve dr ho's surgery appointments */
        this.getDrHoSurgeries = function () {

            var defer = $q.defer();

            $http.get('/Clearvision/_api/appointments/?doctor__name=Dr%20Ho&apptType=Surgery')

                .success(function (listOfAppointments) {
                    $timeout(function () {
                        var drHoSurgeries = listOfAppointments;
                        defer.resolve(drHoSurgeries);
                    }, 100);
                })

                .error(function () {
                    defer.reject("http get failed");
                    console.log("Error getting Dr Ho's surgery appointments");
                });

            return defer.promise;
        };

        /* function to retrieve dr goh's screening appointments */
        this.getDrGohPostSurgeries = function () {

            var defer = $q.defer();

            $http.get('/Clearvision/_api/appointments/?doctor__name=Dr%20Goh&apptType=Post%20Surgery')

                .success(function (listOfAppointments) {
                    $timeout(function () {
                        var drHoPostSurgeries = listOfAppointments;
                        defer.resolve(drHoPostSurgeries);
                    }, 100);
                })

                .error(function () {
                    defer.reject("http get failed");
                    console.log("Error getting Dr Goh's post surgeries appointments");
                });

            return defer.promise;
        };

        /* function to retrieve dr goh's pre-evaluation appointments */
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

        /* function to retrieve dr goh's surgery appointments */
        this.getDrGohSurgeries = function () {

            var defer = $q.defer();

            $http.get('/Clearvision/_api/appointments/?doctor__name=Dr%20Goh&apptType=Surgery')

                .success(function (listOfAppointments) {
                    $timeout(function () {
                        var drGohSurgeries = listOfAppointments;
                        defer.resolve(drGohSurgeries);
                    }, 100);
                })

                .error(function () {
                    defer.reject("http get failed");
                    console.log("Error getting Dr Goh's surgery appointments");
                });

            return defer.promise;
        };

        /* function to retrieve optom's screening appointments */
        this.getOptomScreenings = function () {

            var defer = $q.defer();

            $http.get('/Clearvision/_api/appointments/?doctor__name=Optometrist&apptType=Screening')

                .success(function (listOfAppointments) {
                    $timeout(function () {
                        var optomScreenings = listOfAppointments;
                        defer.resolve(optomScreenings);
                    }, 100);
                })

                .error(function () {
                    defer.reject("http get failed");
                    console.log("Error getting Optom's screening appointments");
                });

            return defer.promise;
        };

        /* function to retrieve optom's screening appointments */
        this.getOptomEyeCare = function () {

            var defer = $q.defer();

            $http.get('/Clearvision/_api/appointments/?doctor__name=Optometrist&apptType=Eyecare')

                .success(function (listOfAppointments) {
                    $timeout(function () {
                        var optomEyeCare = listOfAppointments;
                        defer.resolve(optomEyeCare);
                    }, 100);
                })

                .error(function () {
                    defer.reject("http get failed");
                    console.log("Error getting Optom's eye care appointments");
                });

            return defer.promise;
        };

    });