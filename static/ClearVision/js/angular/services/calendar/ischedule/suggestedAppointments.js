var app = angular.module('suggested.Appointments', []);

app.service('suggestedAppointmentsSvc', function ($http) {

    var self = this;
    self.scope = {};

    self.getScope = function (scope) {
        self.scope = scope;
    };

    /*******************************************************************************
     function to suggest appointments
     *******************************************************************************/

    self.suggestAppointments = function () {

        var apptTypeId = self.scope.fields.appointmentType.id;
        var doctorId = self.scope.fields.doctorAssigned.id;

        var url = '/Clearvision/_api/SuggestedTimeSlots/?apptTypeId=' + apptTypeId + '&doctorId=' + doctorId;

        $http.get(url)
            .success(function (listOfSuggestedAppointments) {
                self.scope.listOfSuggestedAppointments = listOfSuggestedAppointments;
            })

    };

});