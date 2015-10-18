var appConfig = angular.module('app.config', []);

appConfig.controller('configCtrl', function ($scope, $http) {

    $scope.dynamicPopover = {
        content: 'Hello, World!',
        templateUrl: 'myPopoverTemplate.html',
        title: 'Title'
    };

    $scope.showDocConfigForm = true;
    $scope.showDocApptConfigForm = false;
    $scope.docConfigActiveTab = "doctors-tab-active"

    $scope.listOfDoctors = ["Doctor Ho", "Doctor Goh", "Optometrist"];

    $scope.noOfDocs = $scope.listOfDoctors.length;

    $scope.showDocView = function(){
        $scope.showDocConfigForm = true;
        $scope.showDocApptConfigForm = false;
        $scope.docConfigActiveTab = "doctors-tab-active"
    };

    $scope.showDocApptView = function() {
        $scope.showDocConfigForm = false;
        $scope.showDocApptConfigForm = true;
        $scope.docConfigActiveTab = "doc-appt-tab-active"
    };

});
