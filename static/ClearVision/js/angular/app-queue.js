var appPatientQueue = angular.module('app.patientQueue', []);

appPatientQueue.controller('QueueCtrl',
    function ($scope, $http, $location, $rootScope, $timeout, $modal, $log, eventClickSvc, getNoShowSvc, addToArchiveSvc,
              getTodayAppointmentSvc, getPatientQueueSvc) {

        $scope.availableMonths = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        $scope.CurrentDate = new Date();
        $scope.mainTableWidth = "col-md-8";
        $scope.currentPage = 1;
        $scope.numPerPage = 10;
        $scope.filteredArchived = [];

        getNoShowSvc.getScope($scope);
        addToArchiveSvc.getScope($scope);
        getTodayAppointmentSvc.getScope($scope);
        getPatientQueueSvc.getScope($scope);

        $scope.totalItems = 24;
        $scope.currentPage = 1;

        $scope.setPage = function (pageNo) {
            $scope.currentPage = pageNo;
        };

        $scope.orderByField = 'associatedpatientactions__appointment__timeBucket__start';
        $scope.reverseSort = false;


        /*******************************************************************************
         function to get
         *******************************************************************************/


        /* function to get today appointments */
        $scope.getTodayAppointments = function () {
            getTodayAppointmentSvc.getTodayAppointments();
        };

        /* function to get patient queue */
        $scope.getPatientQueue = function () {
            getPatientQueueSvc.getPatientQueue();
        };

        /* function to get no show */
        $scope.getNoShow = function () {
            getNoShowSvc.getNoShow();
        };

        /* function to get archive */
        $scope.getArchive = function () {
            $http.get('/Clearvision/_api/ViewArchive/')
                .success(function (data) {
                    $scope.archiveList = data;

                    /** function for pagination **/
                    $scope.$watch("currentPage + numPerPage", function () {
                        var begin = (($scope.currentPage - 1) * $scope.numPerPage);
                        var end = begin + $scope.numPerPage;

                        $scope.filteredArchived = $scope.archiveList.slice(begin, end);
                    });
                });
        };


        /*******************************************************************************
         function to add
         *******************************************************************************/


        /* function to add to queue */
        $scope.addToQueue = function (apptId, apptType, clinic, doctorId, timeBucket, patientId, hasAttended) {

            $rootScope.spinner = {active: true};

            $scope.postToQueue = {
                "apptId": apptId,
                "apptType": apptType,
                "clinic": clinic,
                "doctor": doctorId,
                "timeBucket": timeBucket,
                "patient": patientId,
                "attended": hasAttended,
                "socketId": $rootScope.socketId
            };

            $http.post('/Clearvision/_api/ViewTodayPatients/', $scope.postToQueue)
                .success(function (result) {

                    getTodayAppointmentSvc.getTodayAppointments();
                    getPatientQueueSvc.getPatientQueue();
                    getNoShowSvc.getNoShow();
                    $rootScope.spinner = {active: false};
                })
                .error(function (data) {

                    $rootScope.spinner = {active: false};
                });

        };

        /* function to add to no show */
        $scope.addToNoShow = function (apptId, apptType, clinic, doctorId, timeBucket, patientContact, hasAttended) {

            $scope.postToNoShow = {
                "apptId": apptId,
                "apptType": apptType,
                "clinic": clinic,
                "doctor": doctorId,
                "timeBucket": timeBucket,
                "patient": patientContact,
                "attended": hasAttended,
                "socketId": $rootScope.socketId
            };

            $http.post('/Clearvision/_api/ViewTodayPatients/', $scope.postToNoShow)
                .success(function (result) {

                    getTodayAppointmentSvc.getTodayAppointments();
                    getPatientQueueSvc.getPatientQueue();
                    getNoShowSvc.getNoShow();
                })
                .error(function (data) {

                    $rootScope.spinner = {active: false};
                });

        };


        /*******************************************************************************
         function to revert
         *******************************************************************************/


        $scope.revertFromQueue = function (apptId, patientId) {

            $rootScope.spinner = {active: true};

            $http.post('/Clearvision/_api/ViewPatientQueue/', {
                "apptId": apptId,
                "patient": patientId,
                "socketId": $rootScope.socketId
            })
                .success(function (data) {

                    $rootScope.spinner = {active: false};
                    getTodayAppointmentSvc.getTodayAppointments();
                    getPatientQueueSvc.getPatientQueue();
                    getNoShowSvc.getNoShow();
                })
                .error(function (data) {

                    $rootScope.spinner = {active: false};
                });

        };


        /*******************************************************************************
         placeholder
         *******************************************************************************/


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
            $scope.mainTableWidth = "col-md-12";
        };

        $scope.sortByField = function (field) {
            $scope.orderByField = field;
            $scope.reverseSort = !$scope.reverseSort;
        };

        $scope.rescheduleAppointment = function (appointmentId, patientId) {
            $location.path('/');
            $scope.getNoShowAppointment(appointmentId, patientId);
        };

        //function to call backend api to get appointment details
        $scope.getNoShowAppointment = function (apptId, patientName) {
            $http.get('/Clearvision/_api/appointments/' + apptId)
                .success(function (data) {
                    var apptDetails = data;

                    $timeout(function (data) {
                        eventClickSvc.eventClick(apptDetails, true, patientName);
                    }, 1000);

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


        /*******************************************************************************
         modal codes
         *******************************************************************************/


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
        };


        /*******************************************************************************
         pusher
         *******************************************************************************/


        /*Pusher.subscribe('queue', 'addToQueue', function (appointment) {

         $log.debug("Receiving socket request to add to queue");
         getTodayAppointmentSvc.getTodayAppointments();
         getPatientQueueSvc.getPatientQueue();
         getNoShowSvc.getNoShow();

         });

         Pusher.subscribe('queue', 'noShow', function (appointment) {

         $log.debug("Receiving socket request to add to no show");
         getTodayAppointmentSvc.getTodayAppointments();
         getPatientQueueSvc.getPatientQueue();
         getNoShowSvc.getNoShow();

         });

         Pusher.subscribe('queue', 'removeFromQueue', function (appointment) {

         $log.debug("Receiving socket request to revert from queue or no show");
         getTodayAppointmentSvc.getTodayAppointments();
         getPatientQueueSvc.getPatientQueue();
         getNoShowSvc.getNoShow();

         });*/

        var addToQueue = $rootScope.pusher.subscribe('queue');
        addToQueue.bind('addToQueue', function (appointment) {

            $log.debug("Receiving socket request to add to queue");
            getTodayAppointmentSvc.getTodayAppointments();
            getPatientQueueSvc.getPatientQueue();
            getNoShowSvc.getNoShow();
        });

        var addToNoShow = $rootScope.pusher.subscribe('queue');
        addToNoShow.bind('noShow', function (appointment) {

            $log.debug("Receiving socket request to add to no show");
            getTodayAppointmentSvc.getTodayAppointments();
            getPatientQueueSvc.getPatientQueue();
            getNoShowSvc.getNoShow();
        });

        var revertFromQueue = $rootScope.pusher.subscribe('queue');
        revertFromQueue.bind('removeFromQueue', function (appointment) {

            $log.debug("Receiving socket request to revert from queue or no show");
            getTodayAppointmentSvc.getTodayAppointments();
            getPatientQueueSvc.getPatientQueue();
            getNoShowSvc.getNoShow();
        });

    });


/*******************************************************************************
 controller for modal instance
 *******************************************************************************/


appPatientQueue.controller('RemarksModalInstanceCtrl', function ($scope, $modalInstance, remarkInfo, appointmentId, $http, getNoShowSvc, addToArchiveSvc) {

    $scope.remarkDetails = remarkInfo;
    $scope.id = appointmentId;


    /*******************************************************************************
     function to post remarks
     *******************************************************************************/


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


    /*******************************************************************************
     function to cancel
     *******************************************************************************/


    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };


    /*******************************************************************************
     function to add to archive
     *******************************************************************************/


    $scope.addToArchive = function (attendedAppointmentId) {
        addToArchiveSvc.addToArchive(attendedAppointmentId, $scope.selectedReason.id);
        $scope.cancel();
    };


    /*******************************************************************************
     function to retrieve cancellation reasons
     *******************************************************************************/


    $scope.retrieveCancellationReasons = function () {
        $http.get('/Clearvision/_api/ViewCancellationReasons/')
            .success(function (data) {
                $scope.cancellationReasons = data;
            })
    };


    /*******************************************************************************
     function to activate modal buttons
     *******************************************************************************/


    $scope.activateModalButtons = function () {
        $scope.showModalButtons = true;
    };


});