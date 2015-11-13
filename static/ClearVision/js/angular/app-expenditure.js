/**
 * Created by carinahu on 10/2/15.
 */
var appExpenditure = angular.module('app.expenditure', []);

appExpenditure.controller('MarketingExpenditureCtrl', function ($scope, $http, $modal, $route, getMarketingChannelsSvc, $filter, $log) {

    $scope.channelDropdown = true;
    $scope.channelTextbox = false;
    $scope.selectChannelBtn = false;
    $scope.newChannelBtn = true;
    $scope.listOfMarketingChannels = [];
    $scope.currentPage = 1;
    $scope.numPerPage = 10;
    $scope.filteredChannels = [];


    /* function to retrieve all marketing channels */
    $scope.getMarketingChannels = function () {
        getMarketingChannelsSvc.getMarketingChannels()
            .then(function (listOfChannels) {

                angular.forEach(listOfChannels, function (channel) {
                    $scope.listOfMarketingChannels.push(channel);
                });

            });
    };


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

    $scope.years = ["2010", "2011", "2012", "2013", "2014", "2015"];
    $scope.months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    $scope.getListOfMarketingExpenditures = function (month, year) {

        var currentDate = new Date();

       // if(month === undefined || year === undefined) {
         //   month = $filter('date')(currentDate, 'MM');
           // year = $filter('date')(currentDate, 'yyyy');
        //}

        $http.get('/Clearvision/_api/InputMarketingChannelCost/?month=' + month + '&year=' + year)
            .success(function (data) {
                $scope.marketingChannels = data;

                /** function for pagination **/
                $scope.$watch("currentPage + numPerPage", function () {
                    var begin = (($scope.currentPage - 1) * $scope.numPerPage)
                    var end = begin + $scope.numPerPage;

                    $scope.filteredChannels = $scope.marketingChannels.slice(begin, end);

                });

            })
            .error(function () {

            });
    };

    var currentDate = new Date();
    var convertMonth = $filter('date')(currentDate, 'MM');
    var convertYear = $filter('date')(currentDate, 'yyyy');
    $scope.expenditureMonth = convertMonth;
    console.log(convertMonth);
    $scope.expenditureYear = convertYear;

    $scope.updateTable = function() {
        $scope.getListOfMarketingExpenditures($scope.expenditureMonth, $scope.expenditureYear);
    }

});