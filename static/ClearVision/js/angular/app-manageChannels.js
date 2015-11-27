var appChannels = angular.module('app.managechannels', []);

appChannels.controller('ManageChannelsCtrl',
    function ($scope, $http, $timeout, $rootScope, getMarketingChannelsStatusSvc, showNotificationsSvc) {

        //$scope.currentPage = 1;
        //$scope.currentPage = 1;
        //$scope.numPerPage = 10;
        $scope.filteredChannelsSpent = [];

        $scope.pagination = {
            currentPage : 1,
            numPerPage : 10
        };
        /*******************************************************************************
         get list of marketing channels spent
         *******************************************************************************/

        $scope.getMarketingChannels = function () {

            $rootScope.spinner = {active: true};

            getMarketingChannelsStatusSvc.getMarketingChannelsStatus()
                .then(function (retrievedChannelsStatus) {

                    $scope.listOfChannelsSpent = retrievedChannelsStatus;
                    $rootScope.spinner = {active: false};

                    $scope.$watch("currentPage + numPerPage", function () {
                var begin = (($scope.pagination.currentPage - 1) * $scope.pagination.numPerPage);
                var end = begin + $scope.pagination.numPerPage;

                $scope.filteredChannelsSpent = $scope.listOfChannelsSpent.slice(begin, end);
                console.log($scope.listOfChannelsSpent);
            });

                }, function (data) {

                    $log.error("Failed to retrieve promises for channel status");
                    $rootScope.spinner = {active: false};
                });

            $scope.listOfChannelsSpent = [];

        };

        $scope.getMarketingChannels();

        $timeout(function () {
            $scope.$watch("currentPage + numPerPage", function () {
                var begin = (($scope.currentPage - 1) * $scope.numPerPage);
                var end = begin + $scope.numPerPage;

                $scope.filteredChannelsSpent = $scope.listOfChannelsSpent.slice(begin, end);
                console.log($scope.listOfChannelsSpent);
            });

        }, 10000);

        /*******************************************************************************
         edit status of marketing channel
         *******************************************************************************/


        $scope.changeMarketingStatus = function (channelId, status) {

            $rootScope.spinner = {active: true};

            var req = {
                method: 'PATCH',
                url: '/Clearvision/_api/EditMarketingChannelsStatus/' + channelId,
                headers: {'Content-Type': 'application/json'},
                data: {
                    "show": !status
                }
            };

            $http(req)
                .success(function () {

                    $scope.getMarketingChannels();
                    showNotificationsSvc.notifySuccessTemplate('Channel status updated successfully');

                }).error(function () {

                    $rootScope.spinner = {active: false};
                    showNotificationsSvc.notifyErrorTemplate('Error updating channel status');
                });

        };


        /*******************************************************************************
         get class to set marketing channels to active equals true or false
         *******************************************************************************/


        $scope.getClass = function (channelStatus) {
            if (channelStatus == true) {
                return 'success';
            }
        };


    });
