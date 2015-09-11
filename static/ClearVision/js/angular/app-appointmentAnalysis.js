var appointmentAnalysis = angular.module('app.appointmentAnalysis', []);

appointmentAnalysis.controller('AppointmentAnalysisCtrl', function ($scope, $http) {

    /* function to get the current month */
    $scope.getCurrentMonth = function () {
        var currentMonth = new Date().getMonth() + 1;
        return currentMonth;
    };


    /*******************************************************************************
     appointment scheduling stacked chart
     *******************************************************************************/


    /* function to retrieve stacked chart data from backend */
    $scope.retrieveStackedChart = function (currentMonth) {
        $http.get('/Clearvision/_api/ViewAppointmentAnalysisStackedChart/?month=' + currentMonth)
            .success(function (data) {
                $scope.stackedChartData = data;
                $scope.showStackedChart($scope.stackedChartData);
            });
    };

    /* c3 function to show stacked chart */
    $scope.showStackedChart = function (data) {

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
                    height: 80,
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
                json: data,
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
    };

    /* call to retrieve stacked chart */
    $scope.retrieveStackedChart($scope.getCurrentMonth());


    /*******************************************************************************
     cancelled appointments pie chart
     *******************************************************************************/


    /* function to retrieve cancelled appointment pie chart from backend */
    $scope.retrieveCancelledAppointments = function (currentMonth) {
        $http.get('/Clearvision/_api/ViewAppointmentAnalysisCancelledAppointments/?month=' + currentMonth)
            .success(function (data) {
                if (Object.keys(data).length == 0) {
                    // there is zero cancelled appointment
                    console.log("There is zero cancelled appointment");
                } else {
                    // there is at least one cancelled appointment
                    console.log("There is at least one cancelled appointment");
                    $scope.cancelledChartData = data;
                    $scope.showCancelledChart($scope.cancelledChartData);
                }
            })
            .error(function (data) {
                console.log("Error");
            });
    };

    /* c3 function to show cancelled pie chart */
    $scope.showCancelledChart = function (data) {

        $scope.pieChartOne = c3.generate({
            bindto: '#pie1',
            padding: {
                top: 30,
                right: 30,
                bottom: 0,
                left: 50
            },
            data: {
                json: data,
                keys: {
                    value: ['Screening', 'Pre Evaluation', 'Surgery', 'Post Surgery 1', 'Post Surgery 2']
                },
                type: 'pie',
                onclick: function (d, element) {
                    var chosenField = d.id;
                    $scope.cancelledMarketingChannel($scope.pieData3);
                }
            }
        });
    };

    /* call to retrieve cancelled chart */
    $scope.retrieveCancelledAppointments($scope.getCurrentMonth());


    /*******************************************************************************
     cancelled marketing channel pie chart
     *******************************************************************************/


    $scope.pieData2 = [
        {
            "Change Clinic": 10,
            "Not Doing Lasik Anymore": 20,
            "Will Schedule Again": 10,
            "Change Of Mind": 30,
            "Others": 30
        }
    ];

    $scope.pieData3 = [
        {
            "Email NewsLetter": 25,
            "Andrea Chong Blog": 25,
            "ABC Magazine": 15,
            "Facebook Ads": 35
        }
    ];

    $scope.cancelledMarketingChannel = function (data) {

        $scope.pieChartOne = c3.generate({
            bindto: '#pie3',
            padding: {
                top: 30,
                right: 30,
                bottom: 0,
                left: 50
            },
            data: {
                json: data,
                keys: {
                    value: ['Email NewsLetter', 'Andrea Chong Blog', 'ABC Magazine', 'Change Of Mind', 'Facebook Ads']
                },
                type: 'pie'
            }
        });
    };

});

