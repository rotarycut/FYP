var appAdmin = angular.module('app.admin', []);

appAdmin.controller('adminCtrl', function ($scope, $http, $modal) {

    /* function to change password */
    $scope.changePassword = function () {

        $http.post('/Clearvision/_api/changepw/', {
            "oldpassword": $scope.fields.oldPassword,
            "newpassword": $scope.fields.newPassword,
            "confirmnewpassword": $scope.fields.confirmNewPassword
        })
            .success(function (data) {

                if (data.error == "Wrong old password / New passwords do not match") {

                    $scope.message = {error: "Old password is wrong. Please try again."};

                } else {

                    $scope.openSuccessModal();
                    $scope.fields = {};
                    $scope.changePwForm.$setPristine();
                    $scope.changePwForm.$setUntouched();
                }

                $scope.message = data;

            })

            .error(function (data) {
                console.log("Error with http post");
            });
    };

    /* function to open change password modal */
    $scope.openPwchangeModal = function (size) {

        var modalInstance = $modal.open({
            animation: $scope.animationsEnabled,
            templateUrl: 'confirmPwchangeModal.html',
            controller: 'PwchangeModalInstanceCtrl',
            size: size
        });
    };

    /* function to check if the change password form is valid */
    $scope.isFormValid = function (formIsValid) {

        // clears the error message
        $scope.message = {'error': ''};

        if (formIsValid) {
            // all the form fields are filled

            // check if new password & confirm password is the same
            if ($scope.fields.newPassword == $scope.fields.confirmNewPassword) {

                // correct match between passwords, sends post to backend
                $scope.changePassword();

            } else {

                // wrong match between passwords, display error
                $scope.message = {error: "New Password does not match. Please reconfirm your new password."};
            }

        } else {
            // not all the form fields are filled, display error messages
        }
    };

    $scope.fields = {};


    /*******************************************************************************
     modal codes
     *******************************************************************************/


    $scope.animationsEnabled = true;

    /* function to open success modal when password is successfully changed */
    $scope.openSuccessModal = function (size) {

        var modalInstance = $modal.open({
            animation: $scope.animationsEnabled,
            templateUrl: 'mySuccessModalContent.html',
            controller: 'ChangePwModalInstanceCtrl',
            size: size
        });
    };

});

appAdmin.config(function ($httpProvider) {
    $httpProvider.defaults.xsrfCookieName = 'csrftoken';
    $httpProvider.defaults.xsrfHeaderName = 'X-CSRFToken';
});

appAdmin.controller('ChangePwModalInstanceCtrl', function ($scope, $modalInstance, $location) {

    $scope.composeSMS = function () {

    };

    $scope.redirect = function () {
        $scope.cancel();
        $location.path('/');
    };

    $scope.cancel = function () {
        $modalInstance.close();
    };
});


