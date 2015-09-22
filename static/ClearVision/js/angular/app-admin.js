var appAdmin = angular.module('app.admin', []);
appAdmin.controller('adminCtrl', function($scope,$http) {

    $scope.changePassword = function () {

        $http.post('/Clearvision/_api/changepw/', {
            "oldpassword": $scope.oldPw,
            "newpassword": $scope.newPw,
            "confirmnewpassword": $scope.newPwConfirmed
        })
                .success(function (data) {
                    console.log("Successful with http post");

                    $scope.errorMessage = data;
                    $scope.oldPw = "";
                    $scope.newPw = "";
                    $scope.newPwConfirmed = "";
                })

                .error(function (data) {
                    console.log("Error with http post");
                });
        };
});

appAdmin.config(function ( $httpProvider) {
   $httpProvider.defaults.xsrfCookieName = 'csrftoken';
    $httpProvider.defaults.xsrfHeaderName = 'X-CSRFToken';
});


