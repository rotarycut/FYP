var appDashboard = angular.module('app.dashboard', []);

appDashboard.controller('DashboardCtrl',
    function ($scope, $http, $modal, $route, postRoiFilterSvc, getMonthListingsSvc, getRoiFilterSvc, showNotificationsSvc) {

        $scope.$route = $route;
        postRoiFilterSvc.getScope($scope);
        getRoiFilterSvc.getScope($scope);
        $scope.isCollapsed = true;
        $scope.showROIChart = true;
        $scope.channelObjects = [];
        $scope.channelLists = [];
        $scope.listOfSelectedChannels = [];
        $scope.listOfSelectedChannelsId = [];
        $scope.listOfFilterYears = ['2015', '2016', '2017', '2018', '2019', '2020', '2021', '2022', '2023', '2024', '2025', '2026', '2027', '2028', '2029', '2030'];
        $scope.listOfFilterMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];


        /*******************************************************************************
         Miscellaneous functions
         *******************************************************************************/

        /* function to initialize chart */
        $scope.initializeChart = function () {
            var currentYear = new Date().getFullYear();

            var monthList = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            var currentMonthShort = new Date().getMonth();
            var currentMonthLong = monthList[currentMonthShort];

            $scope.getRoiData(currentMonthLong + " " + currentYear);
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


        /*******************************************************************************
         retrieve month data for roi chart
         *******************************************************************************/


        $scope.getRoiData = function (monthYear) {

            var spaceIndex = monthYear.indexOf(" ");
            var month = monthYear.substring(0, spaceIndex);
            var year = monthYear.substring(spaceIndex + 1);

            var monthList = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            $scope.currentMonth = monthList.indexOf(month) + 1;
            $scope.currentYear = year;

            var restRequest = '/Clearvision/_api/ViewROIChart/?default=True&year=' + $scope.currentYear + '&month=' + $scope.currentMonth;
            $http.get(restRequest)
                .success(function (roiData) {
                    $scope.showRoiChart(roiData);
                });
        };


        /*******************************************************************************
         retrieve custom data for roi chart
         *******************************************************************************/


        $scope.getCustomRoiData = function (year, month, channelList) {

            var restRequest = '/Clearvision/_api/ViewROIChart/?year=' + year + '&month=' + month + '&channel=' + channelList;

            $http.get(restRequest)
                .success(function (customData) {
                    $scope.showRoiChart(customData);
                });
        };


        /*******************************************************************************
         show roi chart
         *******************************************************************************/


        $scope.showRoiChart = function (newData) {

            $scope.RoiChart = c3.generate({
                bindto: '#roiChart',
                padding: {
                    top: 30,
                    right: 50,
                    bottom: 3,
                    left: 60
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
                            rotate: -25,
                            multiline: false,
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
                        value: ['Expenditure', 'Revenue', 'roi']
                    },
                    axes: {
                        'roi': 'y2'
                    },
                    type: 'bar'
                },
                zoom: {
                    enabled: true
                }
            });

        };


        /*******************************************************************************
         filters
         *******************************************************************************/


        /* function to display list of saved filters */
        $scope.getSavedFilters = function () {
            getRoiFilterSvc.getCustomFilters();
        };

        /* function on click of saved filter */
        $scope.runSavedFilter = function (filterId) {

            $http.get('/Clearvision/_api/EditSavedMarketingChannelCustomFilters/' + filterId)
                .success(function (data) {
                    var listOfChannels = [];
                    angular.forEach(data.channelType, function (channel) {
                        listOfChannels.push(channel.name);
                    });

                    $scope.runFilter(data.startDate, data.endDate, listOfChannels);
                });
        };

        /* function to open filter for edit */
        $scope.openEditFilter = function (startDate, endDate, filterId, filterName) {
            $scope.isCollapsed = false;
            $scope.datepicker = startDate;
            $scope.datepicker2 = endDate;
            $scope.existingFilterName = filterName;

            $http.get('/Clearvision/_api/EditSavedMarketingChannelCustomFilters/' + filterId)
                .success(function (data) {
                    $scope.listOfSelectedChannels = [];

                    angular.forEach(data.channelType, function (individualChannel) {
                        $scope.listOfSelectedChannels.push(individualChannel.name);
                        $scope.listOfSelectedChannelsId.push(individualChannel.id);
                    });

                    angular.forEach($scope.channelObjects, function (channel) {
                        if ($scope.listOfSelectedChannels.indexOf(channel.name) > -1) {
                            channel.channelUnselected = true;
                        }
                    });
                });

            $scope.editFilterId = filterId;
        };

        /* function to transform list box selected channels into string */
        $scope.transformChannelsToStr = function (listOfSelectedChannels) {
            var channelsStr = "";
            var counter = 1;
            angular.forEach(listOfSelectedChannels, function (channel) {
                channelsStr += channel;

                if (counter < listOfSelectedChannels.length) {
                    channelsStr += "&channel=";
                }
                counter++;
            });
            return channelsStr;
        };

        /* run filter */
        $scope.runFilter = function (year, month, channels) {

            var fieldsValid = $scope.validateFilterInputs(year, month, channels);

            if (fieldsValid) {

                var channelList = $scope.transformChannelsToStr(channels);

                month = $scope.listOfFilterMonths.indexOf(month) + 1;

                $scope.getCustomRoiData(year, month, channelList);

            } else {

                // not all filter fields are filled
                $scope.openErrorModal();
            }
        };

        /* save filter */
        $scope.saveFilter = function (year, month, channels) {

            var fieldsValid = $scope.validateFilterInputs(year, month, channels);

            if (fieldsValid) {
                $scope.openSaveFilterModal();

            } else {
                // not all filter fields are filled
                $scope.openErrorModal();
            }
        };

        /* clear filter */
        $scope.clearFilter = function () {
            $scope.filter.filterMonth = undefined;
            $scope.filter.filterYear = undefined;

            angular.forEach($scope.channelObjects, function (channel) {
                channel.channelUnselected = false;
            });

            $scope.listOfSelectedChannels.splice(0);
            $scope.listOfSelectedChannelsId.splice(0);
        };

        /* function to validate if filter inputs are all filled */
        $scope.validateFilterInputs = function (year, month, channels) {
            if (channels.length == 0 || year == undefined || month == undefined) {
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

        /* delete filter */
        $scope.deleteFilter = function (filterId) {

            var req = {
                method: 'DELETE',
                url: '/Clearvision/_api/EditSavedROICustomFilters/' + filterId,
                headers: {'Content-Type': 'application/json'},
            };

            $http(req)
                .success(function () {
                    getRoiFilterSvc.getCustomFilters();
                    showNotificationsSvc.notifySuccessTemplate('Filter deleted successfully');

                }).error(function () {
                    showNotificationsSvc.notifyErrorTemplate('Error deleting filter');
                });

        };


        /*******************************************************************************
         retrieve month listings
         *******************************************************************************/


        $scope.retrieveMonthListings = function () {

            getMonthListingsSvc.getMonthListings()
                .then(function (listOfMonths) {

                    angular.forEach(listOfMonths, function (month) {
                        $scope.savedMonths.push(month);
                    });
                });
        };

        $scope.savedMonths = [];
        $scope.retrieveMonthListings();


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
                size: size,
                resolve: {
                    channelLists: function () {
                        return '';
                    },
                    filterMonth: function () {
                        return '';
                    },
                    filterYear: function () {
                        return '';
                    }
                }
            });
        };

        $scope.openSaveFilterModal = function (size) {

            var modalInstance = $modal.open({
                animation: $scope.animationsEnabled,
                templateUrl: 'myFilterModalContent.html',
                controller: 'RoiModalCtrl',
                size: size,
                resolve: {
                    channelLists: function () {
                        return $scope.listOfSelectedChannelsId;
                    },
                    filterMonth: function () {
                        return $scope.listOfFilterMonths.indexOf($scope.filter.filterMonth) + 1;
                    },
                    filterYear: function () {
                        return $scope.filter.filterYear;
                    }
                }
            });
        };

    });


/*******************************************************************************
 start of modal controller
 *******************************************************************************/


appDashboard.controller('RoiModalCtrl', function ($scope, $modalInstance, $http, showNotificationsSvc, getRoiFilterSvc,
                                                  channelLists, filterYear, filterMonth) {

    /* function to cancel modal */
    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };

    /* function to post filter in modal */
    $scope.postFilter = function (filterName) {

        var req = {
            method: 'POST',
            url: '/Clearvision/_api/ViewSavedROICustomFilters/',
            headers: {'Content-Type': 'application/json'},
            data: {
                "name": filterName,
                "channelTypes": channelLists,
                "year": filterYear,
                "month": filterMonth
            }
        };

        $http(req)
            .success(function () {

                getRoiFilterSvc.getCustomFilters();
                showNotificationsSvc.notifySuccessTemplate('Filter saved successfully');

            }).error(function () {
                showNotificationsSvc.notifyErrorTemplate('Error saving filter');
            });

        $scope.cancel();
    };


});




