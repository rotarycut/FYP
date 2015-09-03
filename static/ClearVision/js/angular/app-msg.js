var appMsgLog = angular.module('app.msgLog', []);

appMsgLog.controller('msgCtrl', function ($scope, $http) {

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



});
