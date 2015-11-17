var appointmentAnalysis = angular.module('app.appointmentAnalysis', []);

appointmentAnalysis.controller('AppointmentAnalysisCtrl',
    function ($scope, $http, $modal, $log, $route, postFilterSvc, editFilterSvc, getStackedChartSvc,
              getPieChartSvc, getCustomStackedChartSvc, scheduleCustomFilterSvc, getMarketingChannelsSvc) {

        $scope.$route = $route;

        /* get scope in services */
        postFilterSvc.getScope($scope);
        editFilterSvc.getScope($scope);
        getStackedChartSvc.getScope($scope);
        getPieChartSvc.getScope($scope);
        getCustomStackedChartSvc.getScope($scope);
        scheduleCustomFilterSvc.getScope($scope);

        /* define variables */
        $scope.existingFilterName = "";
        $scope.isCollapsed = true;
        $scope.savedMonths = ["Oct 15", "Sep 15", "Aug 15", "Jul 15"];
        $scope.innerTab = 'Appointment Type';
        $scope.listOfSelectedAppointmentTypes = [];
        $scope.listOfSelectedAppointmentTypesId = [];
        $scope.outerTab = "Cancelled";
        $scope.sortOptions = ["Turn Up", "No Show", "Cancelled"];
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
            $scope.currentMonth = currentMonth;
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
        $scope.toggleSelection = function (apptType, apptId) {
            var id = $scope.listOfSelectedAppointmentTypes.indexOf(apptType);

            if (id > -1) {
                $scope.listOfSelectedAppointmentTypes.splice(id, 1);
                $scope.listOfSelectedAppointmentTypesId.splice(id, 1);
            } else {
                $scope.listOfSelectedAppointmentTypes.push(apptType);
                $scope.listOfSelectedAppointmentTypesId.push(apptId);
            }
        };

        /* month filter selection in listing */
        $scope.monthSelection = function (selectedMonth) {
            $scope.enableCustomFilter = false;

            if (selectedMonth == "Oct ho") {
                $scope.currentMonth = 10;
            } else if (selectedMonth == "Sep 15") {
                $scope.currentMonth = 9;
            } else if (selectedMonth == "Aug 15") {
                $scope.currentMonth = 8;
            } else if (selectedMonth == "Jul 15") {
                $scope.currentMonth = 7;
            }

            $scope.retrieveStackedChart($scope.currentMonth);
            getPieChartSvc.getFirstPieChart($scope.outerTab, $scope.currentMonth);

        };

        /* change sort option */
        $scope.changeSortOption = function () {
            var queryStr;

            if ($scope.enableCustomFilter) {
                queryStr = '/Clearvision/_api/ViewAppointmentAnalysisStackedChart/?customFilter=True&' + $scope.string + 'sortValue=' + $scope.sortSelected + '&startDate=' + $scope.startDate + '&endDate=' + $scope.endDate;

            } else {
                queryStr = '/Clearvision/_api/ViewAppointmentAnalysisStackedChart/?sortValue=' + $scope.sortSelected + '&month=' + $scope.currentMonth;
            }

            $http.get(queryStr)
                .success(function (data) {
                    $scope.showStackedChart(data);
                });
        };

        /* check if any month in listing is selected */
        $scope.checkOtherMonthSelected = function () {
            var trackMonth = new Date().getMonth() + 1;

            if ($scope.currentMonth != trackMonth) {
                return true;
            } else {
                return false;
            }
        };

        /* clear filter */
        $scope.clearFilter = function () {
            $scope.datepicker = "";
            $scope.datepicker2 = "";

            angular.forEach($scope.apptTypes, function (apptType) {
                apptType.naming = false;
            });

            $scope.existingFilterName = "";
            $scope.listOfSelectedAppointmentTypes.splice(0);
            $scope.listOfSelectedAppointmentTypesId.splice(0);
        };


        /*******************************************************************************
         appointment scheduling stacked chart
         *******************************************************************************/


        /* function to retrieve stacked chart data from backend */
        $scope.retrieveStackedChart = function (currentMonth) {
            getStackedChartSvc.getStackedChart(currentMonth);
        };

        /* c3 function to show stacked chart */
        $scope.showStackedChart = function (data) {
            getStackedChartSvc.showStackedChart(data);
        };

        /* call to retrieve stacked chart */
        $scope.retrieveStackedChart($scope.getCurrentMonth());


        /*******************************************************************************
         custom appointment scheduling stacked chart
         *******************************************************************************/


        $scope.getCustomStackedChart = function (isSavedFilter) {
            getCustomStackedChartSvc.getCustomStackedChart(isSavedFilter);
        };


        /*******************************************************************************
         first appointment pie chart
         *******************************************************************************/


        /* function to retrieve first pie chart from backend */
        $scope.getFirstPieChart = function (type, month) {
            getPieChartSvc.getFirstPieChart(type, month);
        };

        /* c3 function to show appointment type pie chart */
        $scope.appointmentTypeChart = function (data) {

            var currentMonth;
            if ($scope.checkOtherMonthSelected()) {
                currentMonth = $scope.currentMonth;
            } else {
                currentMonth = $scope.getCurrentMonth();
            }

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
                        value: $scope.listOfApptTypes
                    },
                    type: 'pie',
                    onclick: function (d, element) {

                        var chosenField = d.id;

                        if ($scope.enableCustomFilter) {
                            $http.get('/Clearvision/_api/ViewAppointmentAnalysisPartPieApptType/?customFilter=True&pieChartTab=' + $scope.outerTab + '&pieChart=' + $scope.innerTab + '&startDate=' + $scope.startDate + '&endDate=' + $scope.endDate + '&apptType=' + chosenField)
                                .success(function (data) {
                                    //console.log("custom part pie for " + chosenField);
                                    $scope.reasonsChart(data[1])
                                    $scope.marketingChannelChart(data[0]);
                                })

                        } else {
                            $http.get('/Clearvision/_api/ViewAppointmentAnalysisPartPieApptType/?month=' + currentMonth + '&pieChartTab=' + $scope.outerTab + '&pieChart=' + $scope.innerTab + '&apptType=' + chosenField)
                                .success(function (data) {
                                    //console.log(data);
                                    $scope.reasonsChart(data[1])
                                    $scope.marketingChannelChart(data[0]);
                                })
                        }
                    }
                },

                chart: {
                    margin: [0, 0, 0, 0],
                    spacingTop: 0,
                    spacingBottom: 0,
                    spacingLeft: 0,
                    spacingRight: 0
                },
                plotOptions: {
                    pie: {
                        size: '100%',
                        dataLabels: {
                            enabled: false
                        }
                    }
                }
            });
        };

        /* c3 function to show reasons pie chart */
        $scope.reasonsChart = function (data) {

            var currentMonth;
            if ($scope.checkOtherMonthSelected()) {
                currentMonth = $scope.currentMonth;
            } else {
                currentMonth = $scope.getCurrentMonth();
            }

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
                        value: ['Patient chose another clinic', 'Patient will schedule again', 'Patient do not want to do LASIK anymore', 'Too expensive', 'Others']
                    },
                    type: 'pie',
                    onclick: function (d, element) {

                        var chosenField = d.id;

                        if ($scope.enableCustomFilter) {
                            $http.get('/Clearvision/_api/ViewAppointmentAnalysisPartPieApptType/?customFilter=True&pieChartTab=' + $scope.outerTab + '&pieChart=' + $scope.innerTab + '&startDate=' + $scope.startDate + '&endDate=' + $scope.endDate + '&reason=' + chosenField)
                                .success(function (data) {
                                    //console.log("custom part pie for " + chosenField);
                                    $scope.appointmentTypeChart(data[0])
                                    $scope.marketingChannelChart(data[1]);
                                })

                        } else {
                            $http.get('/Clearvision/_api/ViewAppointmentAnalysisPartPieApptType/?month=' + currentMonth + '&pieChartTab=' + $scope.outerTab + '&pieChart=' + $scope.innerTab + '&reason=' + chosenField)
                                .success(function (data) {
                                    //console.log(data);
                                    $scope.appointmentTypeChart(data[0])
                                    $scope.marketingChannelChart(data[1]);
                                })
                        }
                    }
                },

                chart: {
                    margin: [0, 0, 0, 0],
                    spacingTop: 0,
                    spacingBottom: 0,
                    spacingLeft: 0,
                    spacingRight: 0
                },
                plotOptions: {
                    pie: {
                        size: '100%',
                        dataLabels: {
                            enabled: false
                        }
                    }
                }
            });
        };

        /* c3 function to show marketing channel pie chart */
        $scope.marketingChannelChart = function (data) {

            var currentMonth;
            if ($scope.checkOtherMonthSelected()) {
                currentMonth = $scope.currentMonth;
            } else {
                currentMonth = $scope.getCurrentMonth();
            }

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
                        value: $scope.listOfMarketingChannels
                    },
                    type: 'pie',
                    onclick: function (d, element) {

                        var chosenField = d.id;

                        if ($scope.enableCustomFilter) {
                            $http.get('/Clearvision/_api/ViewAppointmentAnalysisPartPieApptType/?customFilter=True&pieChartTab=' + $scope.outerTab + '&pieChart=' + $scope.innerTab + '&startDate=' + $scope.startDate + '&endDate=' + $scope.endDate + '&channel=' + chosenField)
                                .success(function (data) {
                                    //console.log("custom part pie for " + chosenField);
                                    $scope.appointmentTypeChart(data[0]);
                                    $scope.reasonsChart(data[1]);
                                })

                        } else {
                            $http.get('/Clearvision/_api/ViewAppointmentAnalysisPartPieApptType/?month=' + currentMonth + '&pieChartTab=' + $scope.outerTab + '&pieChart=' + $scope.innerTab + '&channel=' + chosenField)
                                .success(function (data) {
                                    //console.log(data);
                                    $scope.appointmentTypeChart(data[0]);
                                    $scope.reasonsChart(data[1]);
                                })
                        }
                    }
                },
                legend: {
                    show: false
                },
                chart: {
                    margin: [0, 0, 0, 0],
                    spacingTop: 0,
                    spacingBottom: 0,
                    spacingLeft: 0,
                    spacingRight: 0
                },
                plotOptions: {
                    pie: {
                        size: '100%',
                        dataLabels: {
                            enabled: false
                        }
                    }
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
            getPieChartSvc.getFirstPieChart($scope.outerTab);
        };


        /*******************************************************************************
         retrieve appointment types
         *******************************************************************************/


        $scope.retrieveAppointmentTypes = function () {
            $http.get('/Clearvision/_api/ViewAllApptTypes/')
                .success(function (data) {
                    angular.forEach(data, function (appt) {
                        $scope.apptTypes.push(appt);
                        $scope.listOfApptTypes.push(appt.name);
                    });

                    getPieChartSvc.getFirstPieChart('Cancelled');
                });
        };

        $scope.apptTypes = [];
        $scope.listOfApptTypes = [];
        $scope.retrieveAppointmentTypes();


        /*******************************************************************************
         retrieve marketing channels
         *******************************************************************************/


        $scope.retrieveMarketingChannels = function () {

            getMarketingChannelsSvc.getMarketingChannels()
                .then(function (listOfMarketingChannels) {

                    angular.forEach(listOfMarketingChannels, function (channel) {
                        $scope.marketingChannels.push(channel);
                        $scope.listOfMarketingChannels.push(channel.name);
                    });
                });
        };

        $scope.marketingChannels = [];
        $scope.listOfMarketingChannels = [];
        $scope.retrieveMarketingChannels();


        /*******************************************************************************
         custom filter codes
         *******************************************************************************/


        /* function to get custom filter */
        $scope.getCustomFilters = function () {
            scheduleCustomFilterSvc.getCustomFilters();
        };
        $scope.getCustomFilters();


        /* function to activate filter */
        $scope.activateFilter = function (filterId) {
            scheduleCustomFilterSvc.activateFilter(filterId);
        };


        /* function to delete filter */
        $scope.deleteFilter = function (filterId) {
            scheduleCustomFilterSvc.deleteFilter(filterId);
        };


        /* function to open filter for edit */
        $scope.openEditFilter = function (startDate, endDate, filterId, filterName) {
            scheduleCustomFilterSvc.openEditFilter(startDate, endDate, filterId, filterName);
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

        $scope.toggleEndDate = function () {

            if ($scope.datepicker != null && $scope.datepicker != "") {
                var startDate = $scope.getFormattedDate($scope.datepicker);
                $scope.minEndDate = new Date(startDate);
            }

            if ($scope.datepicker2 != null && $scope.datepicker2 != "") {
                var endDate = $scope.getFormattedDate($scope.datepicker2)
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


        /*******************************************************************************
         start of modal codes
         *******************************************************************************/


        $scope.animationsEnabled = true;

        $scope.openErrorModal = function (size) {

            var modalInstance = $modal.open({
                animation: $scope.animationsEnabled,
                templateUrl: 'myErrorContent.html',
                controller: 'AppointmentModalCtrl',
                size: size,
                resolve: {
                    existingFilterName: function () {
                        return $scope.existingFilterName;
                    }
                }
            });
        };

        $scope.openSaveFilterModal = function (size) {

            if ($scope.datepicker == undefined || $scope.datepicker2 == undefined || $scope.listOfSelectedAppointmentTypes.length == 0) {

                $scope.openErrorModal();

            } else {

                var modalInstance = $modal.open({
                    animation: $scope.animationsEnabled,
                    templateUrl: 'myFilterModalContent.html',
                    controller: 'AppointmentModalCtrl',
                    size: size,
                    resolve: {
                        existingFilterName: function () {
                            return $scope.existingFilterName;
                        }
                    }
                });
            }
        };

    });


/*******************************************************************************
 start of modal controller
 *******************************************************************************/


appCalendar.controller('AppointmentModalCtrl', function ($scope, $modalInstance, postFilterSvc, editFilterSvc, existingFilterName) {

    $scope.filterName = existingFilterName;

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };

    $scope.postFilter = function () {
        postFilterSvc.postFilter($scope.filterName);
        $scope.cancel();
    };

    /* function to edit filter */
    $scope.editFilter = function (filterId) {

        editFilterSvc.editFilter($scope.filterName);
        $scope.cancel();
    };
});