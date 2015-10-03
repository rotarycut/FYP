/**
 * Created by carinahu on 10/2/15.
 */
var appExpenditure = angular.module('app.expenditure', []);

appExpenditure.controller('MarketingExpenditureCtrl', function ($scope, $http, $modal,$route) {

    $scope.channelDropdown = true;
    $scope.channelTextbox= false;
    $scope.selectChannelBtn= false;
    $scope.newChannelBtn = true;

    $scope.showAddNewChannel = function () {
        $scope.channelDropdown = false;
        $scope.channelTextbox = true;
        $scope.selectChannelBtn = true;
        $scope.newChannelBtn = false;
    };

    $scope.showSelectChannel = function () {
        $scope.channelDropdown = true;
        $scope.channelTextbox = false;
        $scope.selectChannelBtn = false;
        $scope.newChannelBtn = true;
   };


});

