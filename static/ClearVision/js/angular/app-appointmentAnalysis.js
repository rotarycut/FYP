var appointmentAnalysis = angular.module('app.appointmentAnalysis', []);

appointmentAnalysis.controller('AppointmentAnalysisCtrl', function ($scope, $http) {

    /*$scope.testData = [
        {
            "apptType": "screening",
            "turnUp": 10,
            "noShow": 5,
            "cancelled": 7,
            "undecided": 20
        },
        {
            "apptType": "preEval",
            "turnUp": 10,
            "noShow": 2,
            "cancelled": 9,
            "undecided": 20
        },
        {
            "apptType": "surgery",
            "turnUp": 14,
            "noShow": 8,
            "cancelled": 9,
            "undecided": 24
        }
    ];*/

    $scope.retrieveStackedChart = function () {
        $http.get('/Clearvision/_api/ViewAppointmentAnalysisStackedChart/?month=09')
            .success(function (data) {
                $scope.testData = data;
                $scope.showStackedChart($scope.testData);
            });
    };

    $scope.showStackedChart = function (newData) {

        $scope.stackedChart = c3.generate({
            bindto: '#stacked',
            padding: {
                top: 30,
                right: 30,
                bottom: 0,
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
                        text: 'Appointment Types',
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
                        text: '# of appointments',
                        position: 'outer middle'
                    },
                    max: 20,
                    min: 0,
                    padding: {top: 0, bottom: 0}
                }
            },
            data: {
                json: newData,
                keys: {
                    // x: 'name', // it's possible to specify 'x' when category axis
                    x: 'apptType',
                    value: ['Appeared', 'NoShow', 'Cancelled', 'Pending']
                },
                type: 'bar',
                groups: [
                    ['Appeared', 'NoShow', 'Cancelled', 'Pending']
                ],
                order: null
            }
        });

        setTimeout(function () {
            //$scope.marketingChart.toggle('convert');
            //$scope.marketingChart.toggle('rate');
        }, 50);

    };

    $scope.retrieveStackedChart();


    $scope.pieData = [
        {
            "Screening": 20,
            "Pre Evaluation": 20,
            "Surgery": 20,
            "Post Surgery 1": 20,
            "Post Surgery 2": 20
        }
    ];

    $scope.showPieChart = function (newData) {

        $scope.pieChartOne = c3.generate({
            bindto: '#pie1',
            padding: {
                top: 30,
                right: 30,
                bottom: 0,
                left: 50
            },
            data: {
                json: newData,
                keys: {
                    value: ['Screening', 'Pre Evaluation', 'Surgery', 'Post Surgery 1', 'Post Surgery 2']
                },
                type: 'pie'
            }
        });

        setTimeout(function () {
            //$scope.marketingChart.toggle('convert');
            //$scope.marketingChart.toggle('rate');
        }, 50);

    };

    $scope.showPieChart($scope.pieData);

    $scope.pieData2 = [
        {
            "Change Clinic": 10,
            "Not Doing Lasik Anymore": 20,
            "Will Schedule Again": 10,
            "Change Of Mind": 30,
            "Others": 30
        }
    ];

    $scope.showPieChart2 = function (newData) {

        $scope.pieChartOne = c3.generate({
            bindto: '#pie2',
            padding: {
                top: 30,
                right: 30,
                bottom: 0,
                left: 50
            },
            data: {
                json: newData,
                keys: {
                    value: ['Change Clinic', 'Not Doing Lasik Anymore', 'Will Schedule Again', 'Change Of Mind', 'Others']
                },
                type: 'pie'
            }
        });

        setTimeout(function () {
            //$scope.marketingChart.toggle('convert');
            //$scope.marketingChart.toggle('rate');
        }, 50);

    };

    $scope.showPieChart2($scope.pieData2);

    $scope.pieData3 = [
        {
            "Email NewsLetter": 25,
            "Andrea Chong Blog": 25,
            "ABC Magazine": 15,
            "Facebook Ads": 35
        }
    ];

    $scope.showPieChart3 = function (newData) {

        $scope.pieChartOne = c3.generate({
            bindto: '#pie3',
            padding: {
                top: 30,
                right: 30,
                bottom: 0,
                left: 50
            },
            data: {
                json: newData,
                keys: {
                    value: ['Email NewsLetter', 'Andrea Chong Blog', 'ABC Magazine', 'Change Of Mind', 'Facebook Ads']
                },
                type: 'pie'
            }
        });

        setTimeout(function () {
            //$scope.marketingChart.toggle('convert');
            //$scope.marketingChart.toggle('rate');
        }, 50);

    };

    $scope.showPieChart3($scope.pieData3);


});

