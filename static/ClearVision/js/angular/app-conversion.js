var appConversion = angular.module('app.conversion', []);

appConversion.controller('ConversionCtrl', function ($scope, $http, $modal, $route, $filter, postRoiFilterSvc,
                                                     getMarketingChannelsSvc, getMonthListingsSvc,
                                                     scheduleConversionFilterSvc) {

    $scope.$route = $route;
    postRoiFilterSvc.getScope($scope);
    scheduleConversionFilterSvc.getScope($scope);
    $scope.isCollapsed = true;
    $scope.channelObjects = [];
    $scope.channelLists = [];
    $scope.listOfSelectedChannels = [];
    $scope.listOfSelectedChannelsId = [];
    $scope.sortOptions = ["Leads", "Converts", "Rate"];


    /*******************************************************************************
     Miscellaneous functions
     *******************************************************************************/

    /* function to initialize chart */
    $scope.initializeChart = function () {
        var currentMonthYear = $filter('date')(new Date(), 'MMM yyyy');

        $scope.getMonthData(currentMonthYear);
        $scope.getTimeLineData(currentMonthYear);
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
        $scope.minStartDate = null;
        $scope.maxStartDate = null;
        $scope.minEndDate = null;
        $scope.maxEndDate = null;

        angular.forEach($scope.channelObjects, function (channel) {
            channel.channelUnselected = false;
        });

        $scope.listOfSelectedChannels.splice(0);
        $scope.listOfSelectedChannelsId.splice(0);
        $scope.showEditFilterButtons = false;
        $scope.existingFilterName = "";

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

        getMarketingChannelsSvc.getMarketingChannels()
            .then(function (listOfChannels) {

                angular.forEach(listOfChannels, function (channel) {
                    $scope.channelObjects.push(channel);
                    $scope.channelLists.push(channel.name);
                });

            });
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

    /* function to change sort option of bar charts */
    $scope.changeSortOption = function () {

        var queryStr;

        if ($scope.isCustomFilterOn) {
            queryStr = $scope.customFilterUrl + $scope.sortSelected;

        } else {
            queryStr = '/Clearvision/_api/analyticsServer/?channels=all&year=' + $scope.currentYear + '&month=' + $scope.currentMonth + '&sortValue=' + $scope.sortSelected;
        }

        $http.get(queryStr)
            .success(function (sortedList) {
                $scope.showMarketingChart(sortedList);
            });

    };

    /* function to clear sort selected value */
    $scope.clearSortSelected = function () {
        $scope.sortSelected = "";
        $scope.isCustomFilterOn = false;
    };


    /*******************************************************************************
     retrieve month data for marketing chart
     *******************************************************************************/


    $scope.getMonthData = function (selectedMonthYear) {

        var spaceIndex = selectedMonthYear.indexOf(" ");
        var month = selectedMonthYear.substring(0, spaceIndex);
        var year = selectedMonthYear.substring(spaceIndex + 1);

        var monthList = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        var currentMonth = monthList.indexOf(month) + 1;
        var currentYear = year;

        $scope.currentMonth = currentMonth;
        $scope.currentYear = currentYear;

        var restRequest = '/Clearvision/_api/analyticsServer/?channels=all&year=' + currentYear + '&month=' + currentMonth;
        $http.get(restRequest)
            .success(function (data) {
                $scope.newMonthData = data;
                $scope.currentChartMonth = month;
                $scope.showMarketingChart($scope.newMonthData);
            });
    };


    /*******************************************************************************
     retrieve month data for time line chart
     *******************************************************************************/


    $scope.getTimeLineData = function (selectedMonthYear) {

        var spaceIndex = selectedMonthYear.indexOf(" ");
        var month = selectedMonthYear.substring(0, spaceIndex);
        var year = selectedMonthYear.substring(spaceIndex + 1);

        var monthList = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        var currentMonth = monthList.indexOf(month) + 1;
        var currentYear = year;

        $scope.currentMonth = currentMonth;
        $scope.currentYear = currentYear;

        var restRequest = '/Clearvision/_api/analyticsServer/?year=' + currentYear + '&month=' + currentMonth;
        $http.get(restRequest)
            .success(function (data) {
                $scope.newTimeLineData = data;
                $scope.currentChartMonth = month;
                $scope.showTimelineChart($scope.newTimeLineData, $scope.channelLists);
            });
    };


    /*******************************************************************************
     retrieve custom data for marketing chart
     *******************************************************************************/


    $scope.getCustomMarketingData = function (startDate, endDate, channelList) {
        var restRequest = '/Clearvision/_api/analyticsServer/?filterFlag=True&channels=' + channelList + '&startDate=' + startDate + '&endDate=' + endDate + '&timelineFlag=False&sortValue=';

        $scope.isCustomFilterOn = true;
        $scope.customFilterUrl = restRequest;

        restRequest = restRequest + 'Leads';

        $http.get(restRequest)
            .success(function (data) {
                $scope.showMarketingChart(data);
            });
    };


    /*******************************************************************************
     retrieve custom data for time line chart
     *******************************************************************************/


    $scope.getCustomTimeLineData = function (startDate, endDate, channelList, channelArray) {
        var restRequest = '/Clearvision/_api/analyticsServer/?filterFlag=True&channels=' + channelList + '&startDate=' + startDate + '&endDate=' + endDate + '&timelineFlag=True';

        $scope.isCustomFilterOn = true;

        $http.get(restRequest)
            .success(function (data) {
                $scope.showTimelineChart(data, channelArray);
            });
    };


    /*******************************************************************************
     marketing channel bar charts
     *******************************************************************************/


    $scope.showMarketingChart = function (newData) {

        $scope.marketingChart = c3.generate({
            bindto: '#mktgBarCharts',
            padding: {
                top: 40,
                right: 50,
                bottom: 3,
                left: 50
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
                        text: 'Marketing Channels',
                        position: 'outer-center'
                    },
                    tick: {
                        rotate: -25,
                        multiline: false,
                        centered: true
                    },
                    // type: 'category'
                    type: 'category'
                },
                y: {
                    label: {
                        text: 'Count',
                        position: 'outer middle'
                    },
                    //max: 10,
                    min: 0,
                    padding: {top: 0, bottom: 0}
                },
                y2: {
                    show: true,
                    label: {
                        text: 'Conversion Rate (%)',
                        position: 'outer middle'

                    },
                    max: 100,
                    min: 0,
                    padding: {
                        top: 0,
                        bottom: 0
                    },
                    default: [0, 100]

                }
            },
            data: {
                json: newData,
                keys: {
                    // x: 'name', // it's possible to specify 'x' when category axis
                    x: 'channelname',
                    value: ['leads', 'convert', 'rate']
                },
                axes: {
                    'rate': 'y2'
                },
                type: 'bar',
                onclick: function (d, element) {

                    var channelObject = $scope.newMonthData[d.x];
                    var date = new Date();
                    var firstDay = new Date(2015, $scope.currentChartMonth - 1, 1).getDate();
                    var lastDay = new Date(2015, $scope.currentChartMonth, 0).getDate();
                    var startDate = '2015-' + $scope.currentChartMonth + '-' + firstDay;
                    var endDate = '2015-' + $scope.currentChartMonth + '-' + lastDay;

                    var url = '/Clearvision/_api/analyticsServer/?filterFlag=True&channels=' + channelObject.channelname + '&startDate=' + startDate + '&endDate=' + endDate + '&timelineFlag=True&sortValue=Leads';

                    $http.get(url)
                        .success(function (data) {
                            $scope.showTimelineChart(data, [channelObject.channelname]);
                        });

                    /*switch (d.x) {
                     case 0:
                     $scope.showRoiChart(
                     [
                     {
                     "channelname": "Channel News Asia",
                     "marketingDollar": 8100,
                     "revenueDollar": 15552,
                     "roi": 1.92
                     }
                     ]
                     );
                     break;

                     case 1:
                     $scope.showRoiChart(
                     [
                     {
                     "channelname": "Referred by Doctor",
                     "marketingDollar": 2500,
                     "revenueDollar": 19440,
                     "roi": 7.62
                     }
                     ]
                     );
                     break;

                     case 2:
                     $scope.showRoiChart(
                     [
                     {
                     "channelname": "Andrea Chong Blog",
                     "marketingDollar": 1000,
                     "revenueDollar": 19440,
                     "roi": 19.44
                     }
                     ]
                     );
                     break;

                     case 3:
                     $scope.showRoiChart(
                     [
                     {
                     "channelname": "ST Ads",
                     "marketingDollar": 9500,
                     "revenueDollar": 19440,
                     "roi": 2.04
                     }
                     ]
                     );
                     break;

                     case 4:
                     $scope.showRoiChart(
                     [
                     {
                     "channelname": "Others",
                     "marketingDollar": 12000,
                     "revenueDollar": 34992,
                     "roi": 2.92
                     }
                     ]
                     );
                     break;

                     case 5:
                     $scope.showRoiChart(
                     [
                     {
                     "channelname": "987 Radio",
                     "marketingDollar": 21500,
                     "revenueDollar": 19440,
                     "roi": 0.90
                     }
                     ]
                     );
                     break;
                     }*/

                }

            },
            zoom: {
                enabled: true
            }
        });

        setTimeout(function () {
            //$scope.marketingChart.toggle('convert');
            //$scope.marketingChart.toggle('rate');
        }, 50);

    };


    /*******************************************************************************
     marketing channel time line chart
     *******************************************************************************/


    $scope.showTimelineChart = function (newData, marketingDateSeries) {
        $scope.marketingTimeChart = c3.generate({
            bindto: '#timeChart',
            padding: {
                top: 20,
                right: 100,
                bottom: 3,
                left: 45
            },
            data: {
                json: newData,
                keys: {
                    // x: 'name', // it's possible to specify 'x' when category axis
                    x: 'date',
                    value: marketingDateSeries
                }
            },
            axis: {
                x: {
                    type: 'timeseries',
                    tick: {
                        format: '%Y-%m-%d',
                        rotate: -25,
                        multiline: false,
                        centered: true
                    },
                    height: 100,
                    label: {
                        text: 'Time',
                        position: 'outer-center'
                    }
                },
                y: {
                    label: {
                        text: 'Lead Count',
                        position: 'outer middle'
                    },
                    min: 1

                }

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

        $scope.clearFilter();
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
                        channel.channelUnselected = true;
                    }
                });
            });

        $scope.editFilterId = filterId;
        $scope.showEditFilterButtons = true;
    };

    /* function to delete filter */
    $scope.deleteFilter = function (filterId) {
        scheduleConversionFilterSvc.deleteFilter(filterId);
    };


    /*******************************************************************************
     change between lead time line & roi tabs
     *******************************************************************************/


    $scope.showLeadChart = true;

    /* function to show lead time line tab */
    $scope.decideShowLead = function () {
        $scope.showLeadChart = true;
        $scope.showROIChart = false;
    };

    /* function to show roi tab */
    $scope.decideShowROI = function () {
        $scope.showLeadChart = false;
        $scope.showROIChart = true;
    };


    /*******************************************************************************
     retrieve month listings
     *******************************************************************************/


    $scope.retrieveMonthListings = function () {

        getMonthListingsSvc.getMonthListings()
            .then(function (listOfMonths) {

                angular.forEach(listOfMonths, function (month) {
                    $scope.savedMonths.push(month);
                });
            });
    };

    $scope.savedMonths = [];
    $scope.retrieveMonthListings();


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

    $scope.toggleEndDate = function () {

        // length greater than 15 to ensure that this does not run when i click on edit filter which sends in short date
        if ($scope.datepicker != null && $scope.datepicker != "" && $scope.datepicker.toString().length >= 15) {
            var startDate = $scope.getFormattedDate($scope.datepicker);
            $scope.minEndDate = new Date(startDate);
        }

        if ($scope.datepicker2 != null && $scope.datepicker2 != "" && $scope.datepicker2.toString().length >= 15) {
            var endDate = $scope.getFormattedDate($scope.datepicker2);
            $scope.maxStartDate = new Date(endDate);
        }
    };

    $scope.open = function ($event, which) {

        $event.preventDefault();
        $event.stopPropagation();

        $scope.datepickers[which] = true;

        if (which == 'showDatePicker') {
            $scope.datepickers.showDatePicker2 = false;
        }
    };
    $scope.dateOptions = {
        formatYear: 'yy',
        startingDay: 1,
        showWeeks: 'false'
    };
    $scope.formats = ['dd-MMMM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
    $scope.format = $scope.formats[0];
    /* --- end of date picker codes --- */


    /*******************************************************************************
     start of modal codes
     *******************************************************************************/


    $scope.animationsEnabled = true;

    $scope.openErrorModal = function (size) {

        var modalInstance = $modal.open({
            animation: $scope.animationsEnabled,
            templateUrl: 'myErrorContent.html',
            controller: 'RoiModalCtrl',
            size: size,
            resolve: {
                showEditFilterBtn: function () {
                    return $scope.showEditFilterButtons;
                },
                existingFilterName: function () {
                    return '';
                }
            }
        });
    };

    $scope.openSaveFilterModal = function (size) {

        var modalInstance = $modal.open({
            animation: $scope.animationsEnabled,
            templateUrl: 'myFilterModalContent.html',
            controller: 'RoiModalCtrl',
            size: size,
            resolve: {
                showEditFilterBtn: function () {
                    return $scope.showEditFilterButtons;
                },
                existingFilterName: function () {
                    return $scope.existingFilterName;
                }
            }
        });
    };

});


/*******************************************************************************
 start of modal controller
 *******************************************************************************/


appConversion.controller('RoiModalCtrl', function ($scope, $modalInstance, postRoiFilterSvc, scheduleConversionFilterSvc,
                                                   showEditFilterBtn, existingFilterName) {

    $scope.filterName = existingFilterName;
    $scope.showEditFilterBtn = showEditFilterBtn;

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };

    $scope.postFilter = function () {
        postRoiFilterSvc.postFilter($scope.filterName);
        $scope.cancel();
    };

    $scope.editFilter = function (filterName) {
        scheduleConversionFilterSvc.editFilter(filterName);
        $scope.cancel();
    };

});