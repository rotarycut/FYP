angular.module('search.appointments', [])
    .service('searchAppointmentsSvc', function ($http) {

        var self = this;
        self.scope = {};

        self.getScope = function (scope) {
            self.scope = scope;
        };


        /*******************************************************************************
         function to search for appointments in search box
         *******************************************************************************/


        self.searchForAppt = function (searchValue) {

            return $http.get('/Clearvision/_api/SearchBar/?search=' + searchValue + '&limit=15')

                .then(function (response) {

                    var row = response.data;
                    var rowArr = [];

                    angular.forEach(row, function (appt) {
                        var rowStr = appt.apptDate + ", " + appt.apptStart + ", " + appt.doctorname + ", " + appt.apptType + " (" + appt.name + ": " + appt.contact + ")";
                        rowArr.push(rowStr)
                    });

                    return rowArr;
                });

        };

    });