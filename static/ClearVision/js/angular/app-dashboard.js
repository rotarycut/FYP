var appDashboard = angular.module('app.dashboard', []);

appDashboard.controller('DashboardCtrl', function ($scope, $http) {
    $scope.months = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    $scope.initializeChart = function () {
        /*var monthNames = ["January", "February", "March", "April", "May", "June",
         "july", "august", "September", "October", "November", "December"
         ];*/

        var currentMonth = new Date().getMonth() + 1;
        $scope.getMonthData(currentMonth);
    };

    $scope.getMonthData = function (month) {
        var restRequest = '/Clearvision/_api/analyticsServer/?filterFlag=False&channels=all&month=' + month;
        $http.get(restRequest)
            .success(function (data) {
                $scope.newMonthData = data;
                console.log($scope.newMonthData);
                $scope.currentChartMonth = month;
                $scope.showMarketingChart($scope.newMonthData);
                $scope.showTimelineChart([], []);
            });
    };

    $scope.showMarketingChart = function (newData) {

        $scope.marketingChart = c3.generate({
            bindto: '#chart1',
            padding: {
                top: 5,
                right: 80,
                bottom: 5,
                left: 80
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

                    var channel = $scope.newMonthData[d.x];
                    console.log(channel);
                    var date = new Date();
                    var firstDay = new Date(2015, $scope.currentChartMonth - 1, 1).getDate();
                    var lastDay = new Date(2015, $scope.currentChartMonth, 0).getDate();
                    var startDate = '2015-' + $scope.currentChartMonth + '-' + firstDay;
                    var endDate = '2015-' + $scope.currentChartMonth + '-' + lastDay;

                    var url = '/Clearvision/_api/analyticsServer/?channels=' + channel.channelname + '&startDate=' + startDate + '&endDate=' + endDate + '&timelineFlag=True&filterFlag=True';
                    $http.get(url)
                        .success(function (timeLine) {

                            var channelArr = [];
                            channelArr.push(channel.channelname);
                            console.log("ITS IN");
                            console.log(timeLine);
                            console.log(channelArr);
                            $scope.showTimelineChart(timeLine, channelArr);
                        });

                    switch (d.x) {
                        case 0:
                            $scope.showRoiChart(
                                [
                                    {
                                        "channelname": "ST Ads",
                                        "marketingDollar": 100,
                                        "revenueDollar": 2500,
                                        "roi": 1000
                                    }
                                ]
                            );
                            break;

                        case 1:
                            $scope.showRoiChart(
                                [
                                    {
                                        "channelname": "ST Ads",
                                        "marketingDollar": 200,
                                        "revenueDollar": 3000,
                                        "roi": 1000
                                    }
                                ]
                            );
                            break;
                    }

                }
            }


        });

        setTimeout(function () {
            $scope.marketingChart.toggle('convert');
            $scope.marketingChart.toggle('rate');
        }, 50);

    };

    $scope.changeMonthData = function () {

        var monthNames = ["January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];
        var count = 1;
        var index = 0;
        angular.forEach(monthNames, function (month) {

            if (month === $scope.monthData) {
                index = count;
            }
            count++;
        })

        $scope.getMonthData(index);
    };

    $scope.getMarketingTimeline = function () {
        $http.get('http://demo4552602.mockable.io/marketingTimeline')
            .success(function (data) {
                $scope.newTimeline = data;
                $scope.showTimelineChart([]);
            });
    };

    //var marketingDateSeries = ['google search', 'facebook ad'];

    $scope.showTimelineChart = function (newData, marketingDateSeries) {
        $scope.marketingTimeChart = c3.generate({
            bindto: '#timeChart',
            padding: {
                top: 5,
                right: 100,
                bottom: 5,
                left: 80
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
                    height: 60,
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

    var roi = [
        {"channelname": "ST Ads", "marketingDollar": 200, "revenueDollar": 3000, "roi": 1000}
    ];

    $scope.showRoiChart = function (newData) {

        $scope.RoiChart = c3.generate({
            bindto: '#roiChart',
            padding: {
                top: 5,
                right: 30,
                bottom: 5,
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


    $scope.filterChart = function () {

        var startDate = $scope.getFormattedDate($scope.datepicker);
        var endDate = $scope.getFormattedDate($scope.datepicker2);

        console.log(startDate);
        console.log(endDate);
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

    $scope.isCollapsed = true;


    /* --- start of date picker codes --- */
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
    $scope.toggleMin();

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

    /* dropdown multiselect codes --*/
    $scope.channels = [
        {name: 'Andrea Chong Blog', selected: false},
        {name: 'Facebook Ads', selected: true},
        {name: 'Email Newsletter', selected: false},
        {name: 'ABC Magazine', selected: false}
    ];

    $scope.test = function (value) {
        alert("YO");
        angular.forEach($scope.selectedChannels, function (channel) {
            if(channel === $scope.selectedChannel){
                console.log("Channel is already selected");
                $scope.selectedChannel.selected();

            }
        });
    };

    $scope.selectedChannels = [];
});



