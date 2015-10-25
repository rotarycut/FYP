var appConfig = angular.module('app.config', []);

appConfig.controller('configCtrl', function ($scope, $http, $modal, $log,
                                             getDoctorsService,
                                             getClinicsService) {

    $scope.operatingHoursPopover = [];

    $scope.dynamicPopover = {
        editApptColor: {
            isOpen: false,
            templateUrl: 'editApptTypeColorTemplate.html',
            open: function () {
                $scope.dynamicPopover.editApptColor.isOpen = true;
            },
            close: function () {
                $scope.dynamicPopover.editApptColor.isOpen = false;
            }
        },
        editDoc: {
            isOpen: false,
            templateUrl: 'editDocNameTemplate.html',
            editDocName: function (doctor) {
                $scope.docNameOnCal = doctor;
            },
            open: function () {
                $scope.dynamicPopover.editDoc.isOpen = true;
            },
            close: function () {
                $scope.dynamicPopover.editDoc.isOpen = false;
            }
        },
        editHeatmap: {
            isOpen: false,
            templateUrl: 'editHeatmapRngTemplate.html',
            editHeatmapRng: function (range) {
                $scope.heatmapNoOfAppts = range;
            },
            open: function () {
                $scope.dynamicPopover.editHeatmap.isOpen = true;
            },
            close: function () {
                $scope.dynamicPopover.editHeatmap.isOpen = false;
            }
        },
        editApptTimeslot: {
            isOpen: false,
            templateUrl: 'editApptTimeslotTemplate.html',
            open: function () {
                $scope.dynamicPopover.editApptTimeslot.isOpen = true;
            },
            close: function () {
                $scope.dynamicPopover.editApptTimeslot.isOpen = false;
            }
        }
    };

    $scope.showAddNewRngBtn = false;
    $scope.showAddNewDocBtn = true;
    $scope.showDocConfigForm = true;
    $scope.showDocApptConfigForm = false;
    $scope.showApptColorConfigForm = true;
    $scope.showReminderSMSConfigForm = true;
    $scope.showDocInfoForm = true;
    $scope.docConfigActiveTab = "doctors-tab-active";
    $scope.calConfigActiveTab = "appt-color-tab-active";
    $scope.SMSConfigActiveTab = "remindersms-tab-active";
    $scope.listOfOperants = ["=", "<=", ">=", "<", ">"];
    $scope.listOfDoctors = [];
    $scope.listOfTimeslotsAM = ["9:30", "10:00", "10:30", "11:00"];
    $scope.listOfTimeslotsPM = ["2:00", "2:30", "3:00", "3:30", "4:00"];
    $scope.listOfApptTypes = [
        {
            apptType: "Screening",
            color: "#E77471"
        },

        {
            apptType: "Pre-Eval",
            color: "#737CA1"
        },

        {
            apptType: "Surgery",
            color: "#D16587"
        },

        {
            apptType: "Post Surgery",
            color: "#F2BB66"
        },

        {
            apptType: "Eyecare",
            color: "#827839"
        }
    ];

    $scope.listOfHeatmapRange = [
        {
            range: "= 1",
            color: "#00B499"
        },

        {
            range: "= 2 - 3",
            color: "#FF9966"
        },

        {
            range: ">= 4",
            color: "#EA525F"
        }
    ];

    $scope.noOfDocs = $scope.listOfDoctors.length;

    $scope.showDocView = function () {
        $scope.showDocConfigForm = true;
        $scope.showDocApptConfigForm = false;
        $scope.docConfigActiveTab = "doctors-tab-active";
        $scope.showAddNewDocBtn = true;
    };

    $scope.showDocApptView = function () {
        $scope.showDocConfigForm = false;
        $scope.showDocApptConfigForm = true;
        $scope.docConfigActiveTab = "doc-appt-tab-active";
        $scope.showAddNewDocBtn = false;
    };

    $scope.showApptColorView = function () {
        $scope.showApptColorConfigForm = true;
        $scope.showHeatmapColorConfigForm = false;
        $scope.calConfigActiveTab = "appt-color-tab-active"
        $scope.showAddNewRngBtn = false;
    };

    $scope.showHeatmapView = function () {
        $scope.showApptColorConfigForm = false;
        $scope.showHeatmapColorConfigForm = true;
        $scope.calConfigActiveTab = "heatmap-color-tab-active"
        $scope.showAddNewRngBtn = true;
    };

    $scope.showReminderSMSView = function () {
        $scope.showReminderSMSConfigForm = true;
        $scope.shownotifSMSConfigForm = false;
        $scope.SMSConfigActiveTab = "remindersms-tab-active";
    };

    $scope.showSwapSMSView = function () {
        $scope.showReminderSMSConfigForm = false;
        $scope.shownotifSMSConfigForm = true;
        $scope.SMSConfigActiveTab = "swapsms-tab-active";
    };

    $scope.openAddNewDocModal = function (size) {

        var modalInstance = $modal.open({
            animation: true,
            templateUrl: 'myAddNewDocModalTemplate.html',
            controller: 'AppConfigModalInstanceCtrl',
            size: size,
            resolve: {
                patientInfo: function () {
                    return $scope.fields;
                },
                createTracker: function () {
                    return $scope.trackId;
                },
                appointment: function () {
                    return '';
                },
                blockInfo: function () {
                    return $scope.blockFields;
                },
                docInfoFormVisibility : function (){
                    return $scope.showDocInfoForm;
                },
                appointmentsInfo: function(){
                    return $scope.listOfApptTypes;
                }
            }
        });
    };

    //$scope.getOperatingHours();
    $scope.listOfClinics = [];
    $scope.listOfDoctors = [];

    /* function to get all clinics */
    $scope.getClinics = function () {

        getClinicsService.getClinics()
            .then(function (listOfClinics) {

                // only want mt e clinic
                $scope.listOfClinics = listOfClinics[0];

                // push all the operating hours  popovers based on day count
                angular.forEach(listOfClinics[0].Days, function () {

                    $scope.operatingHoursPopover.push({
                        editOptHr: {
                            isOpen: false,
                            templateUrl: 'editOptHourTemplate.html',
                            open: function (index) {
                                $scope.currentIndex = index;
                                $scope.operatingHoursPopover[index].editOptHr.isOpen = true;
                            },
                            close: function (index) {
                                $scope.operatingHoursPopover[index].editOptHr.isOpen = false;
                            }
                        }
                    });
                });

            }, function (data) {
                $log.error("Failed to retrieve clinics");
            });

    };

    /* function to get all doctors */
    $scope.getDoctors = function () {

        getDoctorsService.getDoctors()
            .then(function (listOfDoctors) {
                $scope.listOfDoctors = listOfDoctors;

            }, function (data) {

                $log.error("Failed to retrieve doctors");
            });

    };

    $scope.getClinics();
    $scope.getDoctors();


});



appConfig.controller('AppConfigModalInstanceCtrl', function ($scope, $modalInstance,docInfoFormVisibility,appointmentsInfo) {

    $scope.docInfoFormVisible= docInfoFormVisibility;
    $scope.appointmentTypes = appointmentsInfo;

    $scope.ok = function () {

        $scope.docInfoFormVisible = false;
        $scope.docApptTypeFormVisible = true;
        $scope.StepOneComplete = "completed";
        $scope.showStepChecker = true;
    };

    $scope.cancel = function () {
        console.log = ($scope.docInfoFormVisible);
        $modalInstance.dismiss('cancel');
    };
});