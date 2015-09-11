var appointmentAnalysis = angular.module('app.appointmentAnalysis', []);

appointmentAnalysis.controller('AppointmentAnalysisCtrl', function ($scope, $http) {

    $scope.isCollapsed = true;

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
     first appointment pie chart
     *******************************************************************************/


    /* function to retrieve first pie chart from backend */
    $scope.retrieveFirstPieChart = function (type) {

        $scope.outerTab = type;

        var currentMonth = $scope.getCurrentMonth();

        if ($scope.innerTab == 'Appointment Type') {
            // if inner tab chosen is 'appointment type', outer tab can be anything
            $http.get('/Clearvision/_api/ViewAppointmentAnalysisPiechartApptTypeTab/?month=' + currentMonth + '&piechartType=' + type)
                .success(function (data) {
                    console.log(data);
                    if (Object.keys(data).length == 0) {
                        // there is zero cancelled appointment
                        console.log("There is zero cancelled appointment");
                        $scope.appointmentTypeChart([]);
                        $scope.marketingChannelChart([]);
                    } else {
                        // there is at least one cancelled appointment
                        console.log("There is at least one cancelled appointment");
                        $scope.appointmentTypeChart(data);
                        $scope.marketingChannelChart([]);
                    }
                })
                .error(function (data) {
                    console.log("Error");
                });

        } else if ($scope.innerTab == 'Marketing Channels') {
            // if inner tab chosen is 'marketing channel', outer tab can be anything
            $http.get('/Clearvision/_api/ViewAppointmentAnalysisPiechartMarketingChannelsTab/?month=' + currentMonth + '&piechartType=' + type)
                .success(function (data) {
                    if (Object.keys(data).length == 0) {
                        // there is zero cancelled appointment
                        console.log("There is zero cancelled appointment");
                        $scope.appointmentTypeChart([]);
                        $scope.marketingChannelChart([]);
                    } else {
                        // there is at least one cancelled appointment
                        console.log("There is at least one cancelled appointment!!");
                        $scope.appointmentTypeChart([]);
                        $scope.marketingChannelChart(data);
                    }
                })
        }


    };

    /* c3 function to show appointment type pie chart */
    $scope.appointmentTypeChart = function (data) {

        var currentMonth = $scope.getCurrentMonth();

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
                    $http.get('/Clearvision/_api/ViewAppointmentAnalysisPartPieApptType/?month=' + currentMonth + '&pieChartTab=' + $scope.outerTab + '&pieChart=' + $scope.innerTab + '&apptType=' + chosenField)
                        .success(function (data) {
                            $scope.marketingChannelChart(data);
                        })
                }
            },
            size: {
                width: 200
            }
        });
    };

    /* c3 function to show marketing channel pie chart */
    $scope.marketingChannelChart = function (data) {

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
                    value: ['987 Radio', 'Andrea Chong Blog', 'Channel News Asia', 'Referred by Doctor', 'ST Ads', 'Others']
                },
                type: 'pie'
            },
            size: {
                width: 200
            }
        });
    };

    /* call to retrieve cancelled chart */
    $scope.innerTab = 'Appointment Type';
    $scope.retrieveFirstPieChart('Cancelled');


    /*******************************************************************************
     cancelled marketing channel pie chart
     *******************************************************************************/

    $scope.retrieveOtherPieCharts = function (type) {
        $scope.innerTab = type;
        if ($scope.innerTab == 'Appointment Type') {
            $scope.pieDetails[0].sequence = 1;
            $scope.pieDetails[1].sequence = 2;
            $scope.pieDetails[2].sequence = 3;
        } else if ($scope.innerTab == 'Marketing Channels') {
            $scope.pieDetails[0].sequence = 2;
            $scope.pieDetails[1].sequence = 3;
            $scope.pieDetails[2].sequence = 1;
        }
        $scope.retrieveFirstPieChart($scope.outerTab);
    };

    $scope.pieDetails = [
        {
            pieName: 'pie1',
            sequence: 1
        },
        {
            pieName: 'pie2',
            sequence: 2
        },
        {
            pieName: 'pie3',
            sequence: 3
        }
    ];

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

        }
    ];

    $scope.apptTypes = ["Screening", "Pre-Evaluation", "Lasik", "Post Surgery 1", "Post Surgery 2", "Eyecare"];
    $scope.savedMonths = ["Jan 15", "Feb 15", "Apr 15", "Jul 15", "Aug 15"];
    $scope.savedFilters = ["Year Start", "Year End", "Two Years"];

});