var appWaitingList = angular.module('app.waitingList', []);

appWaitingList.controller('waitListCtrl', function ($scope, $http) {

    $scope.getWaitListAppointments = function () {

        $scope.listOfWaitingAppointments = [];
        $http.get('/Clearvision/_api/Swapper/')
            .success(function (listOfAppointments) {
                angular.forEach(listOfAppointments, function (appointment) {
                    $scope.listOfWaitingAppointments.push(appointment);
                })
                console.log($scope.listOfWaitingAppointments);
            })
    };


    $scope.swapAppointment = function (indexInWaitList) {
        $scope.waitListAppointment = $scope.listOfWaitingAppointments[indexInWaitList];

        var scheduledApptId = $scope.waitListAppointment.scheduledAppointments[0].scheduledApptId;
        var tempApptId = $scope.waitListAppointment.tempApptId;
        var contact = $scope.waitListAppointment.patientcontact;

        var json = {
            scheduledApptId: scheduledApptId,
            tempApptId: tempApptId,
            contact: contact
        };

        $http.post('/Clearvision/_api/Swapper/', json)
            .success(function (listOfAppointments) {

                console.log("Swapped successfully");
                console.log(listOfAppointments);
                //Post is successful
            })
    }

});