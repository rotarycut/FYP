var appointmentAnalysis = angular.module('app.appointmentAnalysis', []);

appointmentAnalysis.controller('AppointmentAnalysisCtrl', function ($scope) {

    $scope.testData = [
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
    ];

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
                    max: 100,
                    min: 0,
                    padding: {top: 0, bottom: 0}
                }
            },
            data: {
                json: newData,
                keys: {
                    // x: 'name', // it's possible to specify 'x' when category axis
                    x: 'apptType',
                    value: ['turnUp', 'noShow', 'cancelled', 'undecided']
                },
                type: 'bar',
                groups: [
                    ['turnUp', 'noShow', 'cancelled', 'undecided']
                ],
                order: null
            }
        });

        setTimeout(function () {
            //$scope.marketingChart.toggle('convert');
            //$scope.marketingChart.toggle('rate');
        }, 50);

    };

    $scope.showStackedChart($scope.testData);

});

