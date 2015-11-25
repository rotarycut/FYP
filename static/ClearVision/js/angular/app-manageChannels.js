var appChannels = angular.module('app.managechannels', []);

appChannels.controller('ManageChannelsCtrl',
    function ($scope, $http, $rootScope, getMarketingChannelsStatusSvc, showNotificationsSvc) {

        $scope.currentPage = 1;
        $scope.numPerPage = 10;
        $scope.filteredChannelsSpent = [];

        /*******************************************************************************
         get list of marketing channels spent
         *******************************************************************************/

        $scope.getMarketingChannels = function () {

            $rootScope.spinner = {active: true};
            $scope.listOfChannelsSpent = [];
            getMarketingChannelsStatusSvc.getMarketingChannelsStatus()
                .then(function (retrievedChannelsStatus) {

                    $scope.listOfChannelsSpent = retrievedChannelsStatus;
                    $rootScope.spinner = {active: false};


                }, function (data) {

                    $log.error("Failed to retrieve promises for channel status");
                    $rootScope.spinner = {active: false};
                });

            $scope.listOfChannelsSpent = [];

        };

        $scope.getMarketingChannels();

        $scope.$watch('currentPage + numPerPage', function () {
            var begin = (($scope.currentPage - 1) * $scope.numPerPage)
                , end = begin + $scope.numPerPage;

            $scope.filteredChannelsSpent = $scope.listOfChannelsSpent.slice(begin, end);
        });

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
