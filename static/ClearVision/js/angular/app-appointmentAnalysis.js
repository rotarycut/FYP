var appointmentAnalysis = angular.module('app.appointmentAnalysis', []);

appointmentAnalysis.controller('AppointmentAnalysisCtrl', function ($scope, $http) {

    $scope.isCollapsed = true;
    $scope.savedMonths = ["Jan 15", "Feb 15", "Apr 15", "Jul 15", "Aug 15"];
    $scope.savedFilters = ["Year Start", "Year End", "Two Years"];
    $scope.innerTab = 'Appointment Type';
    $scope.listOfSelectedAppointmentTypes = [];
    $scope.outerTab = "Cancelled";
    $scope.pieDetails = [
        {
            pieName: 'pieApptType',
            sequence: 1
        },
        {
            pieName: 'pieReason',
            sequence: 2
        },
        {
            pieName: 'pieMarketing',
            sequence: 3
        }
    ];


    /*******************************************************************************
     Miscellaneous functions
     *******************************************************************************/

    /* function to get the current month */
    $scope.getCurrentMonth = function () {
        var currentMonth = new Date().getMonth() + 1;
        return currentMonth;
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

    /* toggle selection for filter list box */
    $scope.toggleSelection = function (apptType) {
        var id = $scope.listOfSelectedAppointmentTypes.indexOf(apptType);

        if (id > -1) {
            $scope.listOfSelectedAppointmentTypes.splice(id, 1);
        } else {
            $scope.listOfSelectedAppointmentTypes.push(apptType);
        }
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
            var queryString;
            if ($scope.enableCustomFilter) {
                console.log($scope.string);
                queryString = "/Clearvision/_api/ViewAppointmentAnalysisPiechartApptTypeTab/?piechartType=" + type + "&customFilter=True&" + $scope.string + "startDate=" + $scope.startDate + "&endDate=" + $scope.endDate;
            } else {
                queryString = '/Clearvision/_api/ViewAppointmentAnalysisPiechartApptTypeTab/?month=' + currentMonth + '&piechartType=' + type;
            }

            console.log("Query: " + queryString);

            $http.get(queryString)
                .success(function (data) {
                    console.log(data);
                    if (Object.keys(data).length == 0) {
                        // there is zero cancelled appointment
                        console.log("There is zero cancelled appointment");
                        $scope.showNoAppointmentRemark = true;
                        $scope.appointmentTypeChart([]);
                        $scope.reasonsChart([]);
                        $scope.marketingChannelChart([]);
                    } else {
                        // there is at least one cancelled appointment
                        console.log("There is at least one cancelled appointment");
                        $scope.showNoAppointmentRemark = false;
                        $scope.appointmentTypeChart(data);
                        $scope.reasonsChart([]);
                        $scope.marketingChannelChart([]);
                    }
                })
                .error(function (data) {
                    console.log("Error");
                });

        } else if ($scope.innerTab == 'Reasons') {
            // if inner tab chosen is 'reasons', outer tab can be anything
            var queryString;
            if ($scope.enableCustomFilter) {
                queryString = "/Clearvision/_api/ViewAppointmentAnalysisPiechartReasonsTab/?piechartType=" + type + "&customFilter=True&" + $scope.string + "startDate=" + $scope.startDate + "&endDate=" + $scope.endDate;
            } else {
                queryString = '/Clearvision/_api/ViewAppointmentAnalysisPiechartReasonsTab/?month=' + currentMonth + '&piechartType=' + type;
            }

            console.log("Query: " + queryString);

            $http.get(queryString)
                .success(function (data) {
                    if (Object.keys(data).length == 0) {
                        // there is zero cancelled appointment
                        console.log("There is zero cancelled appointment");
                        $scope.showNoAppointmentRemark = true;
                        $scope.appointmentTypeChart([]);
                        $scope.reasonsChart([]);
                        $scope.marketingChannelChart([]);
                    } else {
                        // there is at least one cancelled appointment
                        console.log("There is at least one cancelled appointment!!");
                        $scope.showNoAppointmentRemark = false;
                        $scope.appointmentTypeChart([]);
                        $scope.reasonsChart(data);
                        $scope.marketingChannelChart([]);
                    }
                });

        } else if ($scope.innerTab == 'Marketing Channels') {
            // if inner tab chosen is 'marketing channel', outer tab can be anything
            var queryString;
            if ($scope.enableCustomFilter) {
                queryString = "/Clearvision/_api/ViewAppointmentAnalysisPiechartMarketingChannelsTab/?piechartType=" + type + "&customFilter=True&" + $scope.string + "startDate=" + $scope.startDate + "&endDate=" + $scope.endDate;
            } else {
                queryString = '/Clearvision/_api/ViewAppointmentAnalysisPiechartMarketingChannelsTab/?month=' + currentMonth + '&piechartType=' + type;
            }

            console.log("Query: " + queryString);

            $http.get(queryString)
                .success(function (data) {
                    if (Object.keys(data).length == 0) {
                        // there is zero cancelled appointment
                        console.log("There is zero cancelled appointment");
                        $scope.showNoAppointmentRemark = true;
                        $scope.appointmentTypeChart([]);
                        $scope.reasonsChart([]);
                        $scope.marketingChannelChart([]);
                    } else {
                        // there is at least one cancelled appointment
                        console.log("There is at least one cancelled appointment!!");
                        $scope.showNoAppointmentRemark = false;
                        $scope.appointmentTypeChart([]);
                        $scope.reasonsChart([]);
                        $scope.marketingChannelChart(data);
                    }
                });
        }
    };

    /* c3 function to show appointment type pie chart */
    $scope.appointmentTypeChart = function (data) {

        var currentMonth = $scope.getCurrentMonth();

        $scope.pieChartAppt = c3.generate({
            bindto: '#pieApptType',
            padding: {
                top: 30,
                right: 30,
                bottom: 0,
                left: 50
            },
            data: {
                json: data,
                keys: {
                    value: $scope.apptTypes
                },
                type: 'pie',
                onclick: function (d, element) {

                    var chosenField = d.id;

                    if ($scope.enableCustomFilter) {
                        $http.get('/Clearvision/_api/ViewAppointmentAnalysisPartPieApptType/?customFilter=True&pieChartTab=' + $scope.outerTab + '&pieChart=' + $scope.innerTab + '&startDate=' + $scope.startDate + '&endDate=' + $scope.endDate + '&apptType=' + chosenField)
                            .success(function (data) {
                                console.log("custom part pie for " + chosenField);
                                $scope.reasonsChart(data[1])
                                $scope.marketingChannelChart(data[0]);
                            })

                    } else {
                        $http.get('/Clearvision/_api/ViewAppointmentAnalysisPartPieApptType/?month=' + currentMonth + '&pieChartTab=' + $scope.outerTab + '&pieChart=' + $scope.innerTab + '&apptType=' + chosenField)
                            .success(function (data) {
                                console.log(data);
                                $scope.reasonsChart(data[1])
                                $scope.marketingChannelChart(data[0]);
                            })
                    }
                }
            },
            size: {
                width: 200
            }
        });
    };

    /* c3 function to show reasons pie chart */
    $scope.reasonsChart = function (data) {

        var currentMonth = $scope.getCurrentMonth();

        $scope.pieChartReason = c3.generate({
            bindto: '#pieReason',
            padding: {
                top: 30,
                right: 30,
                bottom: 0,
                left: 50
            },
            data: {
                json: data,
                keys: {
                    value: ['Change Clinic', 'Not doing lasik', 'Schedule later appointment', 'Others', 'Change of mind']
                },
                type: 'pie',
                onclick: function (d, element) {

                    var chosenField = d.id;

                    if ($scope.enableCustomFilter) {
                        $http.get('/Clearvision/_api/ViewAppointmentAnalysisPartPieApptType/?customFilter=True&pieChartTab=' + $scope.outerTab + '&pieChart=' + $scope.innerTab + '&startDate=' + $scope.startDate + '&endDate=' + $scope.endDate + '&reason=' + chosenField)
                            .success(function (data) {
                                console.log("custom part pie for " + chosenField);
                                $scope.appointmentTypeChart(data[0])
                                $scope.marketingChannelChart(data[1]);
                            })

                    } else {
                        $http.get('/Clearvision/_api/ViewAppointmentAnalysisPartPieApptType/?month=' + currentMonth + '&pieChartTab=' + $scope.outerTab + '&pieChart=' + $scope.innerTab + '&reason=' + chosenField)
                            .success(function (data) {
                                console.log(data);
                                $scope.appointmentTypeChart(data[0])
                                $scope.marketingChannelChart(data[1]);
                            })
                    }
                }
            },
            size: {
                width: 200
            }
        });
    };

    /* c3 function to show marketing channel pie chart */
    $scope.marketingChannelChart = function (data) {

        var currentMonth = $scope.getCurrentMonth();

        var pieChartMarketing = c3.generate({
            bindto: '#pieMarketing',
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
                type: 'pie',
                onclick: function (d, element) {

                    var chosenField = d.id;

                    if ($scope.enableCustomFilter) {
                        $http.get('/Clearvision/_api/ViewAppointmentAnalysisPartPieApptType/?customFilter=True&pieChartTab=' + $scope.outerTab + '&pieChart=' + $scope.innerTab + '&startDate=' + $scope.startDate + '&endDate=' + $scope.endDate + '&channel=' + chosenField)
                            .success(function (data) {
                                console.log("custom part pie for " + chosenField);
                                $scope.appointmentTypeChart(data[0]);
                                $scope.reasonsChart(data[1]);
                            })

                    } else {
                        $http.get('/Clearvision/_api/ViewAppointmentAnalysisPartPieApptType/?month=' + currentMonth + '&pieChartTab=' + $scope.outerTab + '&pieChart=' + $scope.innerTab + '&channel=' + chosenField)
                            .success(function (data) {
                                console.log(data);
                                $scope.appointmentTypeChart(data[0]);
                                $scope.reasonsChart(data[1]);
                            })
                    }
                }
            },
            size: {
                width: 200
            }
        });
    };


    /*******************************************************************************
     other two pie charts
     *******************************************************************************/


    $scope.retrieveOtherPieCharts = function (type) {
        $scope.innerTab = type;
        if ($scope.innerTab == 'Appointment Type') {
            $scope.pieDetails[0].sequence = 1;
            $scope.pieDetails[1].sequence = 2;
            $scope.pieDetails[2].sequence = 3;
        } else if ($scope.innerTab == 'Reasons') {
            $scope.pieDetails[0].sequence = 2;
            $scope.pieDetails[1].sequence = 1;
            $scope.pieDetails[2].sequence = 3;
        }
        else if ($scope.innerTab == 'Marketing Channels') {
            $scope.pieDetails[0].sequence = 3;
            $scope.pieDetails[1].sequence = 2;
            $scope.pieDetails[2].sequence = 1;
        }
        $scope.retrieveFirstPieChart($scope.outerTab);
    };


    /*******************************************************************************
     retrieve appointment types
     *******************************************************************************/


    $scope.retrieveAppointmentTypes = function () {
        $http.get('/Clearvision/_api/ViewAllApptTypes/')
            .success(function (data) {
                angular.forEach(data, function (appt) {
                    $scope.apptTypes.push(appt.name);
                });

                $scope.retrieveFirstPieChart('Cancelled');
            });
    };

    $scope.apptTypes = [];
    $scope.retrieveAppointmentTypes();


    /*******************************************************************************
     custom appointment scheduling stacked chart
     *******************************************************************************/


    $scope.retrieveCustomStackedChart = function (currentMonth) {
        $scope.startDate = $scope.getFormattedDate($scope.datepicker);
        $scope.endDate = $scope.getFormattedDate($scope.datepicker2);

        $scope.string = "";
        angular.forEach($scope.listOfSelectedAppointmentTypes, function (appt) {
            $scope.string += "apptTypes=";
            $scope.string += appt;
            $scope.string += '&';
        });

        console.log($scope.listOfSelectedAppointmentTypes);
        console.log($scope.string);

        $http.get('/Clearvision/_api/ViewAppointmentAnalysisStackedChart/?customFilter=True&' + $scope.string + 'startDate=' + $scope.startDate + '&endDate=' + $scope.endDate)
            .success(function (data) {
                $scope.stackedCustomChartData = data;
                console.log(data);
                $scope.showStackedChart($scope.stackedCustomChartData);
            });

        $scope.retrieveFirstPieChart($scope.outerTab);
        $scope.enableCustomFilter = true;

    };


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


    /*******************************************************************************
     end of date picker codes
     *******************************************************************************/

});