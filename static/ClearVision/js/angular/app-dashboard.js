var appDashboard = angular.module('app.dashboard', []);

appDashboard.controller('DashboardCtrl', function ($scope, $http) {
    $scope.months = ["july", "june", "may"];

    $scope.initializeChart = function () {
        var monthNames = ["January", "February", "March", "April", "May", "June",
            "july", "August", "September", "October", "November", "December"
        ];

        var currentMonth = monthNames[new Date().getMonth()];
        $scope.getMonthData(currentMonth);

    };

    $scope.getMonthData = function (month) {
        var restRequest = 'http://demo4552602.mockable.io/' + month;
        $http.get(restRequest)
            .success(function (data) {
                $scope.newMonthData = data;
                $scope.showMarketingChart($scope.newMonthData);

            });
    };

    $scope.getMarketingTimeline = function () {
        $http.get('http://demo4552602.mockable.io/marketingTimeline')
            .success(function (data) {
                $scope.newTimeline = data;
                $scope.showTimelineChart($scope.newTimeline);
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
                    max: 400,
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
                    min: 80,
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
                    x: 'name',
                    value: ['Lead', 'Conversion', 'Rate']
                },
                axes: {
                    Bloggers: 'y2'
                },
                type: 'bar'
            }


        });

        setTimeout(function () {
            $scope.marketingChart.toggle('Conversion');
            $scope.marketingChart.toggle('Rate');
        }, 500);

    };


    var marketingDateSeries = ['google search', 'facebook ad'];

    $scope.showTimelineChart = function (newData) {
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
                        format: '%Y-%m-%d'
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
});