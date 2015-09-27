var appWaitingList = angular.module('app.waitingList', []);

appWaitingList.controller('waitListCtrl', function ($scope, $http, $timeout, $interval, $log, updateNotificationCountSvc, getNotificationsSvc,$route) {

    $scope.$route = $route;
    updateNotificationCountSvc.getScope($scope);
    getNotificationsSvc.getScope($scope);

    $scope.getWaitListAppointments = function () {

        $scope.listOfWaitingAppointments = [];
        $http.get('/Clearvision/_api/ViewSwapperTable/')
            .success(function (listOfAppointments) {
                angular.forEach(listOfAppointments, function (appointment) {
                    $scope.listOfWaitingAppointments.push(appointment);
                })
            })
    };

    $scope.swapAppointment = function (indexInWaitList) {
        $scope.waitListAppointment = $scope.listOfWaitingAppointments[indexInWaitList];

        var scheduledApptId = $scope.waitListAppointment.scheduledAppt_id;
        var tempApptId = $scope.waitListAppointment.tempAppt_id;
        var patientId = $scope.waitListAppointment.patient_id;

        var json = {
            "scheduledApptId": scheduledApptId,
            "tempApptId": tempApptId,
            "patientId": patientId
        };

        $http.post('/Clearvision/_api/Swapper/', json)
            .success(function (listOfAppointments) {
                $scope.listOfWaitingAppointments.splice(0);
                $scope.getWaitListAppointments();
            });

    };

    $scope.sendSms = function (indexInWaitList) {
        $scope.waitListAppointment = $scope.listOfWaitingAppointments[indexInWaitList];

        var waitStartTime = $scope.waitListAppointment.tempAppt__timeBucket__start;
        var scheduleStartTime = $scope.waitListAppointment.scheduledAppt__timeBucket__start;
        var scheduleStartDate = $scope.waitListAppointment.scheduledAppt__timeBucket__date;
        var patientName = $scope.waitListAppointment.patient__name;
        var waitStartDate = $scope.waitListAppointment.tempAppt__timeBucket__date;
        var patientContact = $scope.waitListAppointment.patient__contact;
        var apptType = $scope.waitListAppointment.scheduledAppt__apptType;
        var id = $scope.waitListAppointment.id;

        var json = {
            "tempAppt__timeBucket__start": waitStartTime,
            "scheduledAppt__timeBucket__start": scheduleStartTime,
            "scheduledAppt__timeBucket__date": scheduleStartDate,
            "patient__name": patientName,
            "tempAppt__timeBucket__date": waitStartDate,
            "patient__contact": patientContact,
            "scheduledAppt__apptType": apptType,
            "swapperID": id
        };

        console.log(json);

        $http.post('/Clearvision/_api/ViewSwapperTable/', json)
            .success(function (listOfAppointments) {

                console.log("Swapped successfully");
                console.log(listOfAppointments);
                //Post is successful

                $scope.listOfWaitingAppointments.splice(0);
                $scope.getWaitListAppointments();
            })
    };

    $scope.deleteWaitList = function (swapperId) {
        var req = {
            method: 'POST',
            url: '/Clearvision/_api/EditSwapperTable/',
            headers: {'Content-Type': 'application/json'},
            data: {
                "swapperId": swapperId
            }
        };

        $http(req)
            .success(function (data) {

                // there are still patients in the appointment after the deletion
                $log.info("Successfully deleted wait list appointment");

                // reloads wait list appointments
                $scope.listOfWaitingAppointments.splice(0);
                $scope.getWaitListAppointments();

            });
    };

    $scope.getNotifications = function () {
        getNotificationsSvc.getNotifications();
    };

    $scope.updateCount = function () {
        updateNotificationCountSvc.updateCount();
    };

    $scope.haveNotification = false;

    $scope.lastThreeSeconds = function () {
        $scope.highlight = true;

        $timeout(function () {
            $scope.highlight = false;
        }, 3000);
    };

    $scope.lastThreeSeconds();

    /*$interval(function () {
     $scope.getNotifications();
     }, 5000);*/

});