var appPatientQueue = angular.module('app.patientQueue', []);

appPatientQueue.controller('QueueCtrl', function ($scope, $http, $location, eventClickSvc, $timeout, $modal, getNoShowSvc) {

    $scope.CurrentDate = new Date();

    /*$scope.noshows = [
     {
     name: 'Leon',
     contact: '98208578',
     apptType: 'Pre-eval',
     doc: 'Dr. Ho',
     scheduledTime: '2015-08-25, 12:30:00',
     remarks: 'rescheduled to 28 Aug 3pm'
     },
     {
     name: 'Sherman',
     contact: '82301384',
     apptType: 'Surgery',
     doc: 'Dr. Ho',
     scheduledTime: '2015-08-29, 10:00:00',
     remarks: 'called, no answer'
     },
     {
     name: 'Zi-hua',
     contact: '80382942',
     apptType: 'Screening',
     doc: '',
     scheduledTime: '2015-09-02, 14:30:00',
     remarks: ''
     }
     ];*/
    getNoShowSvc.getScope($scope);

    $scope.archives = [
        {
            name: 'Ben',
            contact: '98208578',
            apptType: 'Pre-eval',
            doc: 'Dr. Ho',
            scheduledTime: '2015-08-29, 12:30:00',
            remarks: 'called 3 times, no answer'
        },
        {
            name: 'Max',
            contact: '82301384',
            apptType: 'Surgery',
            doc: 'Dr. Ho',
            scheduledTime: '2015-08-25, 10:00:00',
            remarks: 'appointment cancelled'
        },
    ];

    $scope.totalItems = 24;
    $scope.currentPage = 1;

    $scope.setPage = function (pageNo) {
        $scope.currentPage = pageNo;
    };

    $scope.orderByField = 'timeBucket__start';
    $scope.reverseSort = false;

    $scope.getNoShow = function () {
        getNoShowSvc.getNoShow();
    };

    $scope.getTodayAppointments = function () {

        $http.get('/Clearvision/_api/ViewTodayPatients/')
            .success(function (data) {
                $scope.patientList = data;
                angular.forEach($scope.patientList, function (patient) {
                    if (patient.patients__addedToQueue == false || patient.patients__addedToQueue == true) {
                        patient.disableButtons = true;
                    }
                    else {
                        patient.disableButtons = false;
                    }
                });
                console.log($scope.patientList);
                console.log("OK");
            });
    };

    $scope.getPatientQueue = function () {

        $http.get('/Clearvision/_api/ViewPatientQueue/')
            .success(function (data) {
                $scope.queueList = data;
            });
    };

    $scope.sortByField = function (field) {
        $scope.orderByField = field;
        $scope.reverseSort = !$scope.reverseSort;
    };

    $scope.addToQueue = function (apptId, apptType, clinic, doctor, timeBucket, patientContact, hasAttended) {

        if (doctor === "Dr Ho") {
            doctor = 2;
        } else {
            doctor = 1;
        }

        $scope.postToQueue = {
            "apptId": apptId,
            "apptType": apptType,
            "clinic": clinic,
            "doctor": doctor,
            "timeBucket": timeBucket,
            "patient": patientContact,
            "attended": hasAttended
        };

        $http.post('/Clearvision/_api/ViewTodayPatients/', $scope.postToQueue)
            .success(function (result) {
                console.log("Added to queue successfully.")
                $scope.getTodayAppointments();
                $scope.getPatientQueue();
            });

        console.log($scope.postToQueue);

    };

    $scope.addToNoShow = function (apptId, apptType, clinic, doctor, timeBucket, patientContact, hasAttended) {

        if (doctor === "Dr Ho") {
            doctor = 2;
        } else {
            doctor = 1;
        }

        $scope.postToNoShow = {
            "apptId": apptId,
            "apptType": apptType,
            "clinic": clinic,
            "doctor": doctor,
            "timeBucket": timeBucket,
            "patient": patientContact,
            "attended": hasAttended
        };

        $http.post('/Clearvision/_api/ViewTodayPatients/', $scope.postToNoShow)
            .success(function (result) {
                console.log("Added to no show successfully.")
                $scope.getTodayAppointments();
                $scope.getPatientQueue();
            });

        console.log($scope.postToNoShow);
    };

    $scope.showQueue = true;
    $scope.shrinkLeftTable = true;
    $scope.decideShowQueue = function (shouldShow) {
        $scope.showQueue = shouldShow;
        $scope.shrinkLeftTable = shouldShow;
    };

    $scope.decideShowArchive = function (shouldShow) {
        $scope.showQueue = shouldShow;
        $scope.shrinkLeftTable = shouldShow;
    };

    $scope.revertFromQueue = function (apptId, patientContact) {

        $http.post('/Clearvision/_api/ViewPatientQueue/', {
            "apptId": apptId,
            "patient": patientContact
        })
            .success(function (data) {
                console.log("Success reverting");
                $scope.getTodayAppointments();
                $scope.getPatientQueue();
                $scope.getNoShow();
            })
            .error(function (data) {
                console.log("Error reverting");
            });
    };

    $scope.test = function (appointmentId) {
        $location.path('/');

        $scope.getNoShowAppointment(appointmentId);
    };


    //function to call backend api to get appointment details
    $scope.getNoShowAppointment = function (apptId) {
        $http.get('/Clearvision/_api/appointments/' + apptId)
            .success(function (data) {
                var apptDetails = data;

                $timeout(function (data) {
                    eventClickSvc.eventClick(apptDetails);
                }, 1000);
                console.log("Get appt successfully");
            })
            .error(function (data) {
                console.log("error");
            })
    };

    $scope.getClass = function (queueStatus) {
        if (queueStatus == false) {
            return 'danger';
        } else if (queueStatus == true) {
            return 'success';
        } else {
            //return nothing;
            return;
        }
    };

    /* --- start of edit form delete button modal codes --- */
    $scope.animationsEnabled = true;

    $scope.openRemarksModal = function (id, remarks, size) {

        var modalInstance = $modal.open({
            animation: $scope.animationsEnabled,
            templateUrl: 'myRemarkModalContent.html',
            controller: 'ModalInstanceCtrl',
            size: size,
            resolve: {
                remarkInfo: function () {
                    return remarks;
                },
                appointmentId: function () {
                    return id;
                }
            }
        });
    };
    /* --- end of modal codes --- */
});

/* controller for modal instance */
appPatientQueue.controller('ModalInstanceCtrl', function ($scope, $modalInstance, remarkInfo, appointmentId, $http, getNoShowSvc) {
    $scope.remarkDetails = remarkInfo;

    $scope.postRemarks = function () {

        $http.post('/Clearvision/_api/ViewNoShow/', {
            "attendedApptId": appointmentId,
            "remarks": $scope.remarkDetails
        })
            .success(function (data) {
                console.log("Successfully changed remarks");
                $modalInstance.close();
                getNoShowSvc.getNoShow();
            });
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
});