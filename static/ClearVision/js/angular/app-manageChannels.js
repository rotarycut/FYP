var appChannels = angular.module('app.managechannels', []);

appChannels.controller('ManageChannelsCtrl',
    function ($scope, $http, $rootScope, getMarketingChannelsStatusSvc, showNotificationsSvc) {

        //$scope.currentPage = 1;


        $scope.pagination = {
            currentPage :1,
            numPerPage : 10,
            pageChanged: function () {
                    console.log($scope.pagination.currentPage);
                    console.log($scope.listOfChannelsSpent);
                }
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

                }, function (data) {

                    $log.error("Failed to retrieve promises for channel status");
                    $rootScope.spinner = {active: false};
                });

            $scope.listOfChannelsSpent = [];

        };


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
