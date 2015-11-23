var appExpenditure = angular.module('app.expenditure', []);

appExpenditure.controller('MarketingExpenditureCtrl', function ($scope, $http, $modal, $route, getMarketingChannelsSvc, $filter, showNotificationsSvc, $timeout) {

    $scope.listOfMarketingChannels = [];
    $scope.currentPage = 1;
    $scope.numPerPage = 10;
    $scope.filteredChannels = []
    $scope.expenditure = {
        "yearInput": ""
    };

    /* function to retrieve all marketing channels */
    $scope.getMarketingChannels = function () {
        getMarketingChannelsSvc.getMarketingChannels()
            .then(function (listOfChannels) {

                angular.forEach(listOfChannels, function (channel) {
                    $scope.listOfMarketingChannels.push(channel);
                });

            });
    };

    $scope.years = ["2015", "2016", "2017", "2018", "2019", "2020", "2021", "2022", "2023", "2024", "2025", "2026", "2027", "2028", "2029", "2030"];
    $scope.months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];


    /*******************************************************************************
     get list of marketing expenditures
     *******************************************************************************/

    $scope.getListOfMarketingExpenditures = function (month, year) {

        month = $scope.months.indexOf(month) + 1;

        $http.get('/Clearvision/_api/InputMarketingChannelCost/?month=' + month + '&year=' + year)
            .success(function (data) {
                //console.log(data);

                $scope.marketingChannels = data;

                /** function for pagination **/
                $scope.$watch("currentPage + numPerPage", function () {
                    var begin = (($scope.currentPage - 1) * $scope.numPerPage);
                    var end = begin + $scope.numPerPage;

                    $scope.filteredChannels = $scope.marketingChannels.slice(begin, end);

                });

                var dynamicPopover = [];
                angular.forEach(data, function () {
                    console.log(data);

                    dynamicPopover.push = ({
                        //$scope.dynamicPopover ={
                        editMarketingExpenditure: {
                            isOpen: false,
                            templateUrl: 'editMarketingExpenditureTemplate.html',
                            open: function () {
                                $scope.dynamicPopover.editMarketingExpenditure.isOpen = true;
                            },
                            close: function () {
                                $scope.dynamicPopover.editMarketingExpenditure.isOpen = false;
                            }
                        }
                    });
                });

            })
            .error(function () {

            });
    };

    /*******************************************************************************
     add marketing expenditure in year and month
     *******************************************************************************/

    $scope.addMarketingExpenditures = function (year, month, channel, amt, valid, newChannel) {

        if (valid == true) {

            month = $scope.months.indexOf(month) + 1;

            var date = year + "-" + month + "-01";

            if ($scope.channelTextbox) {
                channel = newChannel;
            }

            /*console.log({
             "name": channel,
             "cost": amt,
             "date": date
             });*/


            if ($scope.IsExistingChannel(channel)) {

                console.log("YAY");
                showNotificationsSvc.notifyErrorTemplate('This is an existing channel');

            } else {

                console.log("EW");

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
                        showNotificationsSvc.notifySuccessTemplate('Marketing expenditure added successfully');
                        $scope.clearForm();
                    })

                    .error(function (data) {
                        showNotificationsSvc.notifyErrorTemplate('Error, please try again');
                    });

            }
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
     function to check if there is an existing channel
     *******************************************************************************/

    /* Check if input channel already exist */
    $scope.IsExistingChannel = function (channel) {

        var month = $scope.months.indexOf($scope.expenditure.monthInput) + 1;

        $http.get('/Clearvision/_api/InputMarketingChannelCost/?month=' + month + '&year=' + $scope.expenditure.yearInput)
            .success(function (data) {

                var test = false;

                channel = channel.toString();

                angular.forEach(data, function (marketingExpenditure) {


                    //console.log(channel);
                    //console.log(marketingExpenditure.name);
                    //console.log(channel == marketingExpenditure.name);

                    if (channel == marketingExpenditure.name) {

                        test = true;
                    }
                });

                return test;
            });

    };

    /*******************************************************************************
     function to delete marketing expenditure
     *******************************************************************************/

    $scope.removeRow = function (channel) {
        //$scope.filteredChannels.splice(channel, 1);
        //console.log(channel.id);
        var req = {
            method: 'DELETE',
            url: '/Clearvision/_api/InputMarketingChannelCost/' + channel.id,
            headers: {'Content-Type': 'application/json'}
        };

        $http(req)
            .success(function () {

                showNotificationsSvc.notifySuccessTemplate('Marketing expenditure deleted successfully');
                $scope.updateTable();
                //$scope.getListOfMarketingExpenditures($scope.expenditureMonth, $scope.expenditureYear);

            })

            .error(function (data) {
                showNotificationsSvc.notifyErrorTemplate('Error, please try again');
            });
    };

    /*******************************************************************************
     function to update marketing expenditure
     *******************************************************************************/

    $scope.updateMarketingExpenditureTable = function (isValid, channel, channelId, cost) {
        if (isValid) {

            var req = {
                method: 'PATCH',
                url: '/Clearvision/_api/InputMarketingChannelCost/' + channelId,
                headers: {'Content-Type': 'application/json'},
                data: {
                    "cost": cost,
                    "name": channel
                }
            };

            $http(req)
                .success(function () {
                    showNotificationsSvc.notifySuccessTemplate('Marketing Expenditure successfully updated');
                    $scope.updateTable();
                })
                .error(function (data) {
                    showNotificationsSvc.notifyErrorTemplate('Error, please try again');
                });

        }
    }

    var currentDate = new Date();
    //var convertMonth = $filter('date')(currentDate, 'MM');
    var convertMonth = $filter('date')(currentDate, 'MMM'); //Jun
    var convertYear = $filter('date')(currentDate, 'yyyy'); //2015


    $scope.getListOfMarketingExpenditures(convertMonth, convertYear);
    $scope.expenditureMonth = convertMonth;
    //console.log(convertMonth);
    $scope.expenditureYear = convertYear;

    $scope.updateTable = function () {
        $scope.getListOfMarketingExpenditures($scope.expenditureMonth, $scope.expenditureYear);
    };

});