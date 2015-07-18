var appSidebar = angular.module('app.sidebar',[]);


appSidebar.controller('sidebarCtrl', function ($scope, $aside) {
    $scope.openAside = function (position) {
        $aside.open({
            animation: $scope.animationsEnabled = true,
            templateUrl: 'aside.html',
            placement: position,
            backdrop: true,
            controller: function ($scope, $modalInstance) {
                $scope.ok = function (e) {
                    $modalInstance.close();
                    e.stopPropagation();
                };
                $scope.cancel = function (e) {
                    $modalInstance.dismiss();
                    e.stopPropagation();
                };
            }
        })
    }
});