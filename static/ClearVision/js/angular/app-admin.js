var appAdmin = angular.module('app.admin', []);
appAdmin.controller('adminCtrl', function ($scope, $http, $modal) {

    $scope.changePassword = function () {

        $http.post('/Clearvision/_api/changepw/', {
            "oldpassword": $scope.oldPw,
            "newpassword": $scope.newPw,
            "confirmnewpassword": $scope.newPwConfirmed
        })
            .success(function (data) {
                console.log("Successful with http post");

                $scope.message = data;
                $scope.oldPw = "";
                $scope.newPw = "";
                $scope.newPwConfirmed = "";

                $scope.openPwchangeModal('sm');
            })

            .error(function (data) {
                console.log("Error with http post");
            });
    };

    $scope.openPwchangeModal = function (size) {

        var modalInstance = $modal.open({
            animation: $scope.animationsEnabled,
            templateUrl: 'confirmPwchangeModal.html',
            controller: 'PwchangeModalInstanceCtrl',
            size: size,
        });
    };
});

appAdmin.config(function ($httpProvider) {
    $httpProvider.defaults.xsrfCookieName = 'csrftoken';
    $httpProvider.defaults.xsrfHeaderName = 'X-CSRFToken';
});

appAdmin.controller('PwchangeModalInstanceCtrl', function ($scope, $modalInstance, $http) {


    $scope.composeSMS = function () {

    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
});


