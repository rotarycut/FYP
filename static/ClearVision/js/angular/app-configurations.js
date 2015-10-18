var appConfig = angular.module('app.config', []);

appConfig.controller('configCtrl', function ($scope, $http) {

    $scope.dynamicPopover = {
        content: 'Hello, World!',
        templateUrl: 'myPopoverTemplate.html',
        title: 'Title'
    };

    $scope.listOfDoctors = ["Doctor Ho", "Doctor Goh", "Optometrist"];


    $scope.noOfDocs = $scope.listOfDoctors.length;

});
