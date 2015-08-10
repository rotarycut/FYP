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

});