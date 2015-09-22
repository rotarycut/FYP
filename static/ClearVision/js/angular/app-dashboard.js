var appDashboard = angular.module('app.dashboard', []);

appDashboard.controller('DashboardCtrl', function ($scope, $http, $modal, postRoiFilterSvc) {

    postRoiFilterSvc.getScope($scope);
    $scope.isCollapsed = true;
    $scope.showROIChart = true;
    $scope.channelObjects = [];
    $scope.channelLists = [];
    $scope.listOfSelectedChannels = [];
    $scope.listOfSelectedChannelsId = [];
    $scope.savedMonths = [
        {
            long: "Sep 15",
            short: "9"
        },
        {
            long: "Aug 15",
            short: "8"
        },
        {
            long: "Jul 15",
            short: "7"
        }
    ];


    /*******************************************************************************
     Miscellaneous functions
     *******************************************************************************/

    /* function to initialize chart */
    $scope.initializeChart = function () {
        var currentMonth = new Date().getMonth() + 1;
        $scope.getRoiData(currentMonth);
    };

    /* function to format date */
    $scope.getFormattedDate = function (fullDate) {
        var year = fullDate.getFullYear();

        var month = fullDate.getMonth() + 1;
        if (month <= 9) {
            month = '0' + month;
        }

        var day = fullDate.getDate();
        if (day <= 9) {
            day = '0' + day;
        }

        var formattedDate = year + '-' + month + '-' + day;
        return formattedDate;
    };

    /* run filter */
    $scope.runFilter = function (start, end, channels) {

        console.log(start);
        console.log(end);
        console.log(channels);

        var fieldsValid = $scope.validateFilterInputs(start, end, channels);

        if (fieldsValid) {
            var startDate;
            var endDate;

            if (start.toString().length > 10 || end.toString().length > 10) {
                startDate = $scope.getFormattedDate(start);
                endDate = $scope.getFormattedDate(end);
            } else {
                // do not need formatting if it is clicked from a saved filter
                startDate = start;
                endDate = end;
            }

            var channelList = $scope.transformChannelsToStr(channels);

            $scope.getCustomMarketingData(startDate, endDate, channelList);
            $scope.getCustomTimeLineData(startDate, endDate, channelList, channels);

        } else {
            // not all filter fields are filled
            $scope.openErrorModal();
        }
    };

    /* save filter */
    $scope.saveFilter = function () {

        var fieldsValid = $scope.validateFilterInputs($scope.datepicker, $scope.datepicker2, $scope.listOfSelectedChannels);

        if (fieldsValid) {
            $scope.openSaveFilterModal();

        } else {
            // not all filter fields are filled
            $scope.openErrorModal();
        }
    };

    /* clear filter */
    $scope.clearFilter = function () {
        $scope.datepicker = "";
        $scope.datepicker2 = "";

        angular.forEach($scope.channelObjects, function (channel) {
            channel.channelUnselected = false;
        });

        $scope.listOfSelectedChannels.splice(0);
        $scope.listOfSelectedChannelsId.splice(0);
    };

    /* function to validate if filter inputs are all filled */
    $scope.validateFilterInputs = function (startDate, endDate, channelList) {
        if (startDate == undefined || endDate == undefined || channelList.length == 0) {
            return false;
        } else {
            return true;
        }
    };

    /* toggle selection in filter list box */
    $scope.toggleSelection = function (channel, channelId) {
        var id = $scope.listOfSelectedChannels.indexOf(channel);

        if (id > -1) {
            $scope.listOfSelectedChannels.splice(id, 1);
            $scope.listOfSelectedChannelsId.splice(id, 1);
        } else {
            $scope.listOfSelectedChannels.push(channel);
            $scope.listOfSelectedChannelsId.push(channelId);
        }
    };

    /* function to retrieve all marketing channels */
    $scope.getMarketingChannels = function () {
        $http.get('/Clearvision/_api/ViewAllMarketingChannels/')
            .success(function (data) {
                angular.forEach(data, function (channel) {
                    $scope.channelObjects.push(channel);
                    $scope.channelLists.push(channel.name);
                })
            })
    };

    /* function to transform list box selected channels into string */
    $scope.transformChannelsToStr = function (listOfSelectedChannels) {
        var channelsStr = "";
        var counter = 1;
        angular.forEach(listOfSelectedChannels, function (channel) {
            channelsStr += channel;

            if (counter < listOfSelectedChannels.length) {
                channelsStr += ',';
            }
            counter++;
        });
        return channelsStr;
    };


    /*******************************************************************************
     retrieve month data for roi chart
     *******************************************************************************/


    $scope.getRoiData = function (month) {
        var restRequest = '/Clearvision/_api/ViewROIChart/?default=True&month=' + month;
        $http.get(restRequest)
            .success(function (data) {
                $scope.newRoiData = data;
                $scope.currentChartMonth = month;
                $scope.showRoiChart($scope.newRoiData);
            });
    };


    /*******************************************************************************
     retrieve custom data for roi chart
     *******************************************************************************/


    $scope.getCustomRoiData = function (startDate, endDate, channelList, channelArray) {

        var restRequest = '/Clearvision/_api/ViewROIChart/?channel=987%20Radio&channel=Others&channel=ST%20Ads&startDate=2015-08-02&endDate=2015-08-05';

        $http.get(restRequest)
            .success(function (data) {
                $scope.showROIChart(data, channelArray);
            });
    };


    /*******************************************************************************
     show roi chart
     *******************************************************************************/


    $scope.showRoiChart = function (newData) {

        $scope.RoiChart = c3.generate({
            bindto: '#roiChart',
            padding: {
                top: 40,
                right: 170,
                bottom: 3,
                left: 60
            },
            bar: {
                width: {
                    ratio: 0.2
                }
            },
            axis: {
                x: {
                    height: 100,
                    label: {
                        text: '',
                        position: 'outer-center'
                    },
                    tick: {
                        centered: true
                    },
                    // type: 'category'
                    type: 'category'
                },
                y: {
                    label: {
                        text: '$ Spent',
                        position: 'outer middle'
                    },
                    padding: {top: 0, bottom: 0}

                },
                y2: {
                    show: true,
                    label: {
                        text: 'ROI / Marketing $ Spent',
                        position: 'outer middle'

                    },
                    padding: {
                        top: 0,
                        bottom: 0
                    },
                    max: 20,
                    min: 0,
                    default: [0, 100]

                }
            },
            data: {
                json: newData,
                keys: {
                    // x: 'name', // it's possible to specify 'x' when category axis
                    x: 'channelname',
                    value: ['Expenditure', 'Revenue', 'roi']
                },
                axes: {
                    'roi': 'y2'
                },
                type: 'bar'
            }
        });

    };


    /*******************************************************************************
     saved filters
     *******************************************************************************/


    /* function to display list of saved filters */
    $scope.getSavedFilters = function () {
        $http.get('/Clearvision/_api/ViewSavedMarketingChannelCustomFilters/')
            .success(function (data) {
                $scope.savedFilters = data;
            });
    };

    /* function on click of saved filter */
    $scope.runSavedFilter = function (filterId) {

        $http.get('/Clearvision/_api/EditSavedMarketingChannelCustomFilters/' + filterId)
            .success(function (data) {
                var listOfChannels = [];
                angular.forEach(data.channelType, function (channel) {
                    listOfChannels.push(channel.name);
                });

                $scope.runFilter(data.startDate, data.endDate, listOfChannels);
            });
    };

    /* function to open filter for edit */
    $scope.openEditFilter = function (startDate, endDate, filterId, filterName) {
        $scope.isCollapsed = false;
        $scope.datepicker = startDate;
        $scope.datepicker2 = endDate;
        $scope.existingFilterName = filterName;

        $http.get('/Clearvision/_api/EditSavedMarketingChannelCustomFilters/' + filterId)
            .success(function (data) {
                $scope.listOfSelectedChannels = [];

                angular.forEach(data.channelType, function (individualChannel) {
                    $scope.listOfSelectedChannels.push(individualChannel.name);
                    $scope.listOfSelectedChannelsId.push(individualChannel.id);
                });

                angular.forEach($scope.channelObjects, function (channel) {
                    if ($scope.listOfSelectedChannels.indexOf(channel.name) > -1) {
                        console.log("YAY");
                        channel.channelUnselected = true;
                    }
                });
            });

        $scope.editFilterId = filterId;
    };


    /*******************************************************************************
     placeholder
     *******************************************************************************/

    $scope.getMarketingTimeline = function () {
        $http.get('http://demo4552602.mockable.io/marketingTimeline')
            .success(function (data) {
                $scope.newTimeline = data;
                $scope.showTimelineChart([]);
            });
    };

    //$scope.getMonths();
    //$scope.getJulyData();
    $scope.changeData = function (month) {

        $scope.getMonthData(month);

        /*$scope.marketingChart.load({
         json: $scope.julyChart,
         keys: {
         x: 'name',
         value: ['Lead', 'Conversion', 'Rate']
         },
         unload: $scope.marketingChart.columns
         });*/
    }


    /*******************************************************************************
     start of date picker codes
     *******************************************************************************/


    $scope.datepickers = {
        showDatePicker: false,
        showDatePicker2: false
    };
    $scope.disabled = function (date, mode) {
        return ( mode === 'day' && ( date.getDay() === 0 || date.getDay() === 7 ) );
    };
    $scope.today = function () {
        $scope.datePickerCalendar = new Date();
    };
    $scope.today();

    $scope.clear = function () {
        $scope.datePickerCalendar = null;
    };
    $scope.toggleMin = function () {
        $scope.minDate = $scope.minDate ? null : new Date();
    };

    $scope.open = function ($event, which) {

        $event.preventDefault();
        $event.stopPropagation();

        $scope.datepickers[which] = true;
    };
    $scope.dateOptions = {
        formatYear: 'yy',
        startingDay: 1,
        showWeeks: 'false'
    };
    $scope.formats = ['dd-MMMM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
    $scope.format = $scope.formats[0];
    /* --- end of date picker codes --- */

    $scope.test = function (value) {
        alert("YO");
        angular.forEach($scope.selectedChannels, function (channel) {
            if (channel === $scope.selectedChannel) {
                console.log("Channel is already selected");
                $scope.selectedChannel.selected();

            }
        });
    };

    $scope.selectedChannels = [];


    /*******************************************************************************
     start of modal codes
     *******************************************************************************/


    $scope.animationsEnabled = true;

    $scope.openErrorModal = function (size) {

        var modalInstance = $modal.open({
            animation: $scope.animationsEnabled,
            templateUrl: 'myErrorContent.html',
            controller: 'RoiModalCtrl',
            size: size
        });
    };

    $scope.openSaveFilterModal = function (size) {

        var modalInstance = $modal.open({
            animation: $scope.animationsEnabled,
            templateUrl: 'myFilterModalContent.html',
            controller: 'RoiModalCtrl',
            size: size
        });
    };

});


/*******************************************************************************
 start of modal controller
 *******************************************************************************/


appDashboard.controller('RoiModalCtrl', function ($scope, $modalInstance, postRoiFilterSvc) {

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };

    $scope.postFilter = function () {
        postRoiFilterSvc.postFilter($scope.filterName);
        $scope.cancel();
    };

});




