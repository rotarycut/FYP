var appSidebar = angular.module('app.sidebar', []);


appSidebar.controller('sidebarCtrl', function ($scope, $aside, $http) {
    $scope.openAside = function (position) {
        $aside.open({
            animation: $scope.animationsEnabled = true,
            templateUrl: 'aside.html',
            placement: position,
            backdrop: true,
            controller: function ($scope, $modalInstance) {
                $scope.ok = function (e) {
                    $modalInstance.close();
                    e.stopPropagation();

                    //Asynchronous HTTP Post will be called when the 'OK' button is clicked
                    $http.post('/Clearvision/_api/appointments/', {

                        //Sample data. Will bind with inputs once the form is finalized.
                        "type": "Test Type",
                        "start": "2015-07-17T07:16:35Z",
                        "end": "2015-07-17T07:50:35Z",
                        "creation_time": "2015-07-19T07:16:36Z",
                        "patient": 2,
                        "doctor": 1,
                        "clinic": 2

                    }).success(function (data) {
                        alert("Appointment has been added successfully.");

                    }).error(function (data) {
                        alert("Appointment is not added.");

                    });

                };
                $scope.cancel = function (e) {
                    $modalInstance.dismiss();
                    e.stopPropagation();
                };
            }
        })
    }
});