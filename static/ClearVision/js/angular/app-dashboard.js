var appDashboard = angular.module('app.dashboard', []);

appDashboard.controller('DashboardCtrl', function ($scope, $http, $modal, postRoiFilterSvc) {

    $scope.months = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    var roi = [
        {"channelname": "ST Ads", "marketingDollar": 200, "revenueDollar": 3000, "roi": 1000}
    ];
    postRoiFilterSvc.getScope($scope);
    $scope.isCollapsed = true;
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
    $scope.savedFilters = ["SocialM", "Magazine", "SEO", "E-commerce"];


    /*******************************************************************************
     Miscellaneous functions
     *******************************************************************************/

    /* function to initialize chart */
    $scope.initializeChart = function () {
        var currentMonth = new Date().getMonth() + 1;
        $scope.getMonthData(currentMonth);
        $scope.getTimeLineData(currentMonth);
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
     retrieve month data for marketing chart
     *******************************************************************************/


    $scope.getMonthData = function (month) {
        var restRequest = '/Clearvision/_api/analyticsServer/?channels=all&month=' + month;
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


    $scope.getTimeLineData = function (month) {
        var restRequest = '/Clearvision/_api/analyticsServer/?month=' + month;
        $http.get(restRequest)
            .success(function (data) {
                $scope.newTimeLineData = data;
                $scope.currentChartMonth = month;
                $scope.showTimelineChart($scope.newTimeLineData, $scope.channelLists);
            });
    };


    /*******************************************************************************
     retrieve month data for roi chart
     *******************************************************************************/


    $scope.getRoiData = function (month) {

    };


    /*******************************************************************************
     retrieve custom data for marketing chart
     *******************************************************************************/


    $scope.getCustomMarketingData = function (startDate, endDate, channelList) {
        var restRequest = '/Clearvision/_api/analyticsServer/?filterFlag=True&channels=' + channelList + '&startDate=' + startDate + '&endDate=' + endDate + '&timelineFlag=False&sortValue=Leads';

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
                left: 40
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
                    max: 10,
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

            }
        });

        setTimeout(function () {
            //$scope.marketingChart.toggle('convert');
            //$scope.marketingChart.toggle('rate');
        }, 50);

    };


    /*******************************************************************************
     show time line chart
     *******************************************************************************/


    $scope.showTimelineChart = function (newData, marketingDateSeries) {
        $scope.marketingTimeChart = c3.generate({
            bindto: '#timeChart',
            padding: {
                top: 20,
                right: 50,
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
                    max: 10,
                    min: 1

                }

            }
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
                right: 50,
                bottom: 3,
                left: 45
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
                    value: ['marketingDollar', 'revenueDollar', 'roi']
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

        console.log('/Clearvision/_api/EditSavedMarketingChannelCustomFilters/' + filterId);

        $http.get('/Clearvision/_api/EditSavedMarketingChannelCustomFilters/' + filterId)
            .success(function (data) {
                var listOfChannels = [];
                angular.forEach(data.channelType, function (channel) {
                    listOfChannels.push(channel.name);
                });

                $scope.runFilter(data.startDate, data.endDate, listOfChannels);
            });
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




