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
          size: size,
        });
  };

});

appMsgLog.controller('ComposeModalInstanceCtrl', function ($scope, $modalInstance, $http) {


    $scope.composeSMS = function () {

    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
});