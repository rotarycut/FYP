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
                $scope.showMarketingChart($scope.newMonthData);

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
                    var url = '/Clearvision/_api/analyticsServer/?channels=' + channel.channelname + '&startDate=2015-07-01&endDate=2015-07-30&timelineFlag=True&filterFlag=True';
                    $http.get(url)
                        .success(function (timeLine) {
                            var channelArr = [];
                            channelArr.push(channel.channelname);
                            console.log("ITS IN");
                            console.log(timeLine);
                            console.log(channelArr);
                            $scope.showTimelineChart(timeLine, channelArr);
                        });

                    /*switch (d.x) {
                     case 0:
                     $scope.showTimelineChart(
                     [
                     {"date": "2015-07-01", "google search": 5},
                     {"date": "2015-07-02", "google search": 2},
                     {"date": "2015-07-03", "google search": 7},
                     {"date": "2015-07-04", "google search": 2},
                     {"date": "2015-07-05", "google search": 4},
                     {"date": "2015-07-06", "google search": 6},
                     {"date": "2015-07-07", "google search": 0},
                     {"date": "2015-07-08", "google search": 8},
                     {"date": "2015-07-09", "google search": 3},
                     {"date": "2015-07-10", "google search": 12},
                     {"date": "2015-07-11", "google search": 4},
                     {"date": "2015-07-12", "google search": 6}

                     ]
                     );
                     break;

                     case 1:
                     $scope.showTimelineChart(
                     [
                     {"date": "2015-07-01", "facebook ad": 5},
                     {"date": "2015-07-02", "facebook ad": 12},
                     {"date": "2015-07-03", "facebook ad": 8},
                     {"date": "2015-07-04", "facebook ad": 2},
                     {"date": "2015-07-05", "facebook ad": 9},
                     {"date": "2015-07-06", "facebook ad": 12},
                     {"date": "2015-07-07", "facebook ad": 5},
                     {"date": "2015-07-08", "facebook ad": 8},
                     {"date": "2015-07-09", "facebook ad": 3},
                     {"date": "2015-07-10", "facebook ad": 2},
                     {"date": "2015-07-11", "facebook ad": 9},
                     {"date": "2015-07-12", "facebook ad": 5}

                     ]
                     );
                     break;
                     }*/

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
                left: 100
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

                }

            }
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

    $scope.isCollapsed = true;


});