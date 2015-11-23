var appExpenditure = angular.module('app.expenditure', []);

appExpenditure.controller('MarketingExpenditureCtrl', function ($scope, $http, $modal, $route, getMarketingChannelsSvc, $filter, showNotificationsSvc, $timeout) {


    /*******************************************************************************
     initial initialization
     *******************************************************************************/


    $scope.listOfMarketingChannels = [];
    $scope.currentPage = 1;
    $scope.numPerPage = 10;
    $scope.filteredChannels = [];
    $scope.expenditure = {
        "yearInput": ""
    };

    $scope.years = ["2015", "2016", "2017", "2018", "2019", "2020", "2021", "2022", "2023", "2024", "2025", "2026", "2027", "2028", "2029", "2030"];
    $scope.months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    var currentDate = new Date();
    var convertMonth = $filter('date')(currentDate, 'MMM'); //Jun
    var convertYear = $filter('date')(currentDate, 'yyyy'); //2015

    $scope.getListOfMarketingExpenditures(convertMonth, convertYear);
    $scope.expenditureMonth = convertMonth;
    $scope.expenditureYear = convertYear;


    /*******************************************************************************
     get list of marketing expenditures
     *******************************************************************************/


    $scope.getListOfMarketingExpenditures = function (month, year) {

        month = $scope.months.indexOf(month) + 1;

        $http.get('/Clearvision/_api/InputMarketingChannelCost/?month=' + month + '&year=' + year)
            .success(function (data) {

                $scope.marketingChannels = data;

                /** function for pagination **/
                $scope.$watch("currentPage + numPerPage", function () {
                    var begin = (($scope.currentPage - 1) * $scope.numPerPage);
                    var end = begin + $scope.numPerPage;

                    $scope.filteredChannels = $scope.marketingChannels.slice(begin, end);
                });

                var marketingChannelPopover = [];
                angular.forEach(data, function () {
                    marketingChannelPopover.push({
                        editMarketingExpenditure: {
                            isOpen: false,
                            templateUrl: 'editMarketingExpenditureTemplate.html',
                            open: function (index, channelName, channelCost, channelId) {

                                // ensure that all marketing channel edit popovers are closed on select
                                var idx = 0;

                                angular.forEach($scope.marketingChannels, function () {
                                    $scope.marketingChannelPopover[idx].editMarketingExpenditure.isOpen = false;
                                    idx++;
                                });

                                // set the current popover index, channel name, channel cost & channel id
                                $scope.popoverIndex = index;
                                $scope.popoverChannelName = channelName;
                                $scope.popoverChannelCost = channelCost;
                                $scope.popoverChannelId = channelId;

                                $scope.marketingChannelPopover[index].editMarketingExpenditure.isOpen = true;
                            },
                            close: function (index) {
                                $scope.marketingChannelPopover[index].editMarketingExpenditure.isOpen = false;
                            }
                        }
                    });
                });

                $scope.marketingChannelPopover = marketingChannelPopover;

            })
            .error(function () {

            });
    };


    /*******************************************************************************
     add marketing expenditure in year and month
     *******************************************************************************/


    $scope.addMarketingExpenditures = function (year, month, channel, amt, isValid) {

        var monthShort = month;

        if (isValid) {

            month = $scope.months.indexOf(month) + 1;

            var date = year + "-" + month + "-01";

            var req = {
                method: 'POST',
                url: '/Clearvision/_api/InputMarketingChannelCost/',
                headers: {'Content-Type': 'application/json'},
                data: {
                    "name": channel,
                    "cost": amt,
                    "date": date
                }
            };

            $http(req)
                .success(function () {
                    $scope.getListOfMarketingExpenditures(monthShort, year);
                    $scope.expenditureYear = year;
                    $scope.expenditureMonth = monthShort;
                    showNotificationsSvc.notifySuccessTemplate('Marketing expenditure added successfully');
                    $scope.clearForm();
                })

                .error(function (data) {
                    showNotificationsSvc.notifyErrorTemplate('Error, please try again');
                });
        }
    };


    /*******************************************************************************
     function to clear form
     *******************************************************************************/


    $scope.clearForm = function () {
        $timeout(function () {
            $scope.expenditure = {};
            $scope.expenditureForm.$setPristine();
            $scope.expenditureForm.$setUntouched();
        }, 0);
    };


    /*******************************************************************************
     function to delete marketing expenditure
     *******************************************************************************/


    $scope.removeMarketingChannel = function (channelId) {

        var req = {
            method: 'DELETE',
            url: '/Clearvision/_api/InputMarketingChannelCost/' + channelId,
            headers: {'Content-Type': 'application/json'}
        };

        $http(req)
            .success(function () {

                showNotificationsSvc.notifySuccessTemplate('Marketing expenditure deleted successfully');
                $scope.getListOfMarketingExpenditures($scope.expenditureMonth, $scope.expenditureYear);
            })

            .error(function (data) {
                showNotificationsSvc.notifyErrorTemplate('Error, please try again');
            });
    };


    /*******************************************************************************
     function to update marketing expenditure
     *******************************************************************************/


    $scope.updateMarketingExpenditure = function (isValid, channelName, channelCost, channelId) {

        if (isValid) {

            var req = {
                method: 'PATCH',
                url: '/Clearvision/_api/InputMarketingChannelCost/' + channelId,
                headers: {'Content-Type': 'application/json'},
                data: {
                    "cost": channelCost,
                    "name": channelName
                }
            };

            $http(req)
                .success(function () {
                    showNotificationsSvc.notifySuccessTemplate('Marketing Expenditure successfully updated');
                    $scope.marketingChannelPopover[$scope.popoverIndex].editMarketingExpenditure.close($scope.popoverIndex);
                    $scope.getListOfMarketingExpenditures($scope.expenditureMonth, $scope.expenditureYear);
                })
                .error(function (data) {
                    showNotificationsSvc.notifyErrorTemplate('Error, please try again');
                });
        }
    };

});