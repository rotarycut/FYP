var appMsgLog = angular.module('app.msgLog', []);

appMsgLog.controller('msgCtrl', function ($scope, $http, $modal) {

    $scope.mails = [
        {
            name: 'Philip Horbacheuski',
            title: 'Hi, Welcome to Google Mail',
            datetime: '2015-08-25, 12:30:00',
        },
        {
            name: 'Nikola Foley',
            title: 'Hi, Welcome to Google Mail',
            datetime: '2015-08-25, 12:30:00',
        }
    ];

    $scope.openComposeModal = function (size) {

        $scope.animationsEnabled = true;

        var modalInstance = $modal.open({
            animation: $scope.animationsEnabled,
            templateUrl: 'myComposeModalContent.html',
            controller: 'ComposeModalInstanceCtrl',
            size: size
        });
    };

    /* function to get a list of received sms */
    $scope.getReceivedSms = function () {

        $http.get('/Clearvision/_api/ViewReceivedSMS')
            .success(function (data) {

                $scope.listOfReceivedSms = data.results;
            });
    };

    /* function to get a list of sent sms */
    $scope.getSentSms = function () {

        $http.get('/Clearvision/_api/ViewSentSMS')
            .success(function (data) {

                $scope.listOfSentSms = data.results;
            });
    };

    /* function to get a list of swappable appointments */
    $scope.getSwappedAppointments = function () {

        $http.get('/Clearvision/_api/ViewSwappedPatientsInInbox')
            .success(function (data) {

                $scope.listOfSwappableAppointments = data;
                console.log(data);
            });
    };


    $scope.showReceivedSms = function () {
        $scope.receivedSmsView = true;
        $scope.sentSmsView = false;
        $scope.swapAppointmentView = false;
    };

    $scope.showSentSms = function () {
        $scope.receivedSmsView = false;
        $scope.sentSmsView = true;
        $scope.swapAppointmentView = false;
    };

    $scope.showSwappedAppointments = function () {
        $scope.receivedSmsView = false;
        $scope.sentSmsView = false;
        $scope.swapAppointmentView = true;
    };

});

appMsgLog.controller('ComposeModalInstanceCtrl', function ($scope, $modalInstance, $http) {


    $scope.composeSMS = function () {

    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
});