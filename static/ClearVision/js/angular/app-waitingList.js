var appWaitingList = angular.module('app.waitingList', []);

appWaitingList.controller('waitListCtrl', function ($scope, $http, $timeout, updateNotificationCountSvc, getNotificationsSvc) {

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

        var waitStartTime = $scope.waitListAppointment.tempAppt__timeBucket__start;
        var scheduleStartTime = $scope.waitListAppointment.scheduledAppt__timeBucket__start;
        var scheduleStartDate = $scope.waitListAppointment.scheduledAppt__timeBucket__date;
        var patientName = $scope.waitListAppointment.patient__name;
        var waitStartDate = $scope.waitListAppointment.tempAppt__timeBucket__date;
        var patientContact = $scope.waitListAppointment.patient__contact;
        var apptType = $scope.waitListAppointment.scheduledAppt__apptType;

        //var scheduledApptId = $scope.waitListAppointment.scheduledAppointments[0].scheduledApptId;
        //var tempApptId = $scope.waitListAppointment.tempApptId;
        //var contact = $scope.waitListAppointment.patientcontact;

        var json = {
            "tempAppt_timeBucket_start": waitStartTime,
            "scheduledAppt_timeBucket_start": scheduleStartTime,
            "scheduledAppt_timeBucket_date": scheduleStartDate,
            "patient_name": patientName,
            "tempAppt_timeBucket_date": waitStartDate,
            "patient_contact": patientContact,
            "scheduledAppt_apptType": apptType
        };

        console.log(json);

        $http.post('/Clearvision/_api/Swapper/', json)
            .success(function (listOfAppointments) {

                console.log("Swapped successfully");
                console.log(listOfAppointments);
                //Post is successful

                $scope.listOfWaitingAppointments.splice(0);
                $scope.getWaitListAppointments();
            })
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
    }

    $scope.lastThreeSeconds();

});