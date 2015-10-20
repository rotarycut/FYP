var appConfig = angular.module('app.config', []);

appConfig.controller('configCtrl', function ($scope, $http) {
    $scope.dynamicPopover = {
        editOptHr:{
            isOpen: false,
            templateUrl: 'editOptHourTemplate.html',
            open: function(){
                $scope.dynamicPopover.editOptHr.isOpen = true;
            },
            close: function () {
                $scope.dynamicPopover.editOptHr.isOpen = false;
            }
        },
        editApptColor:{
            templateUrl: 'editApptTypeColorTemplate.html',
        },
        editDoc:{
            templateUrl: 'editDocNameTemplate.html',
            editDocName: function(doctor){
                $scope.docNameOnCal = doctor;
            },
        },
        editHeatmap:{
            templateUrl: 'editHeatmapRngTemplate.html',
            editHeatmapRng: function(range){
                $scope.heatmapNoOfAppts = range;
            },
        },
        editApptTimeslot:{
            templateUrl: 'editApptTimeslotTemplate.html',
        }
    };
    $scope.showAddNewRngBtn = false;
    $scope.showAddNewDocBtn = true;
    $scope.showDocConfigForm = true;
    $scope.showDocApptConfigForm = false;
    $scope.showApptColorConfigForm = true;
    $scope.docConfigActiveTab = "doctors-tab-active";
    $scope.calConfigActiveTab = "appt-color-tab-active";
    $scope.listOfOperants = ["=", "<=", ">=", "<", ">"];
    $scope.listOfDoctors = ["Doctor Ho", "Doctor Goh", "Optometrist"];
    $scope.listOfTimeslotsAM = ["9:30", "10:00", "10:30","11:00"];
    $scope.listOfTimeslotsPM = ["2:00", "2:30", "3:00","3:30","4:00"];
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

    $scope.listOfHeatmapRange = [
        {range: "= 1",
         color: "#00B499"},

        {range: "= 2 - 3",
         color: "#FF9966"},

        {range: ">= 4",
         color: "#EA525F"}
    ];

    $scope.noOfDocs = $scope.listOfDoctors.length;

    $scope.showDocView = function(){
        $scope.showDocConfigForm = true;
        $scope.showDocApptConfigForm = false;
        $scope.docConfigActiveTab = "doctors-tab-active";
        $scope.showAddNewDocBtn = true;
    };

    $scope.showDocApptView = function() {
        $scope.showDocConfigForm = false;
        $scope.showDocApptConfigForm = true;
        $scope.docConfigActiveTab = "doc-appt-tab-active";
        $scope.showAddNewDocBtn = false;
    };

    $scope.showApptColorView = function(){
        $scope.showApptColorConfigForm = true;
        $scope.showHeatmapColorConfigForm = false;
        $scope.calConfigActiveTab = "appt-color-tab-active"
        $scope.showAddNewRngBtn = false;
    }

    $scope.showHeatmapView = function(){
        $scope.showApptColorConfigForm = false;
        $scope.showHeatmapColorConfigForm = true;
        $scope.calConfigActiveTab = "heatmap-color-tab-active"
        $scope.showAddNewRngBtn = true;
    }

});


