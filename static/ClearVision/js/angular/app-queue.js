var appPatientQueue = angular.module('app.patientQueue', []);

appPatientQueue.controller('QueueCtrl', function ($scope, $http, $location, eventClickSvc, $timeout, $modal, getNoShowSvc, addToArchiveSvc) {

    $scope.CurrentDate = new Date();
    $scope.mainTableWidth = "col-md-8";

    getNoShowSvc.getScope($scope);
    addToArchiveSvc.getScope($scope);

    /*$scope.archives = [
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
     ];*/

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
                    if (patient.associatedpatientactions__addedToQueue == false || patient.associatedpatientactions__addedToQueue == true) {
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
                angular.forEach(data, function (appt) {
                    var indexOfT = appt.last_modified.indexOf("T") + 1;
                    var indexOfLastColon = appt.last_modified.lastIndexOf(":");
                    appt.last_modified = appt.last_modified.substring(indexOfT, indexOfLastColon);
                });

                $scope.queueList = data;
            });
    };

    $scope.sortByField = function (field) {
        $scope.orderByField = field;
        $scope.reverseSort = !$scope.reverseSort;
    };

    $scope.addToQueue = function (apptId, apptType, clinic, doctor, timeBucket, patientId, hasAttended) {

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
            "patient": patientId,
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

    $scope.getArchive = function () {

        $http.get('/Clearvision/_api/ViewArchive/')
            .success(function (data) {
                $scope.archiveList = data;
            });
    };

    $scope.showQueue = true;
    $scope.showApptList = function () {
        $scope.showQueue = true;
        $scope.showMonthFilter = false;
        $scope.mainTableWidth = "col-md-8";
    };

    $scope.showNoshow = function () {
        $scope.showQueue = false;
        $scope.showMonthFilter = false;
        $scope.mainTableWidth = "col-md-12";
    };

    $scope.showArchive = function () {
        $scope.showQueue = false;
        $scope.showMonthFilter = true;
        $scope.mainTableWidth = "col-md-10";
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

    $scope.rescheduleAppointment = function (appointmentId) {
        $location.path('/');

        $scope.getNoShowAppointment(appointmentId);
    };

    //function to call backend api to get appointment details
    $scope.getNoShowAppointment = function (apptId) {
        $http.get('/Clearvision/_api/appointments/' + apptId)
            .success(function (data) {
                var apptDetails = data;

                $timeout(function (data) {
                    eventClickSvc.eventClick(apptDetails, true);
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
            controller: 'RemarksModalInstanceCtrl',
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

    $scope.openArchiveModal = function (id, remarks, size) {

        var modalInstance = $modal.open({
            animation: $scope.animationsEnabled,
            templateUrl: 'myArchiveModalContent.html',
            controller: 'RemarksModalInstanceCtrl',
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
    }
    /* --- end of modal codes --- */

    $scope.availableMonths = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

});

/* controller for modal instance */
appPatientQueue.controller('RemarksModalInstanceCtrl', function ($scope, $modalInstance, remarkInfo, appointmentId, $http, getNoShowSvc, addToArchiveSvc) {
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

    $scope.id = appointmentId;

    $scope.addToArchive = function (attendedAppointmentId) {
        console.log(attendedAppointmentId);
        addToArchiveSvc.addToArchive(attendedAppointmentId, $scope.selectedReason.id);
        $scope.cancel();
    };

    /* function to receive cancellation reasons */
    $scope.retrieveCancellationReasons = function () {
        $http.get('/Clearvision/_api/ViewCancellationReasons/')
            .success(function (data) {
                $scope.cancellationReasons = data;
            })
    };

    $scope.activateModalButtons = function () {
        $scope.showModalButtons = true;
    };
});