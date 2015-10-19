var appConfig = angular.module('app.config', []);

appConfig.controller('configCtrl', function ($scope, $http) {

    $scope.dynamicPopover = {
        editOptHr:{
            templateUrl: 'editOptHourTemplate.html',
            title: 'Title'
        },
        editApptColor:{
            templateUrl: 'editApptTypeColorTemplate.html',
            title: 'Title'
        }

    };

    $scope.showDocConfigForm = true;
    $scope.showDocApptConfigForm = false;
    $scope.showApptColorConfigForm = true;
    $scope.docConfigActiveTab = "doctors-tab-active"
    $scope.calConfigActiveTab = "appt-color-tab-active"

    $scope.listOfDoctors = ["Doctor Ho", "Doctor Goh", "Optometrist"];
    $scope.listOfApptTypes = [
        {apptType: "Screening",
         color: "#E77471"},

        {apptType: "Pre-Eval",
         color: "#737CA1"},

        {apptType: "Surgery",
         color: "#D16587"},

        {apptType: "Post Surgery",
         color: "#F2BB66"},

        {apptType: "Eyecare",
         color: "#827839"}
    ];

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

    $scope.showApptColorView = function(){
        $scope.showApptColorConfigForm = true;
        $scope.calConfigActiveTab = "appt-color-tab-active"
    }

    $scope.showHeatmapView = function(){
        $scope.calConfigActiveTab = "heatmap-color-tab-active"
    }

});


