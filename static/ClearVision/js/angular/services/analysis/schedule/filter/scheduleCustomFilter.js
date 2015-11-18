angular.module('schedule.customFilter', [])
    .service('scheduleCustomFilterSvc', function ($http, getPieChartSvc, showNotificationsSvc) {

        var self = this;
        self.scope = {};

        self.getScope = function (scope) {
            self.scope = scope;
        };


        /* function to get custom filter */
        self.getCustomFilters = function () {

            $http.get('/Clearvision/_api/ViewSavedApptTypeCustomFilters/')
                .success(function (data) {
                    self.scope.savedFilters = data;
                })
        };


        /* function to activate filter */
        self.activateFilter = function (filterId) {

            $http.get('/Clearvision/_api/EditSavedApptTypeCustomFilters/' + filterId)
                .success(function (data) {

                    self.scope.startDate = data.startDate;
                    self.scope.endDate = data.endDate;
                    var listOfFilterAppointmentTypes = [];

                    angular.forEach(data.apptType, function (individualApptType) {
                        listOfFilterAppointmentTypes.push(individualApptType.name);
                    });

                    self.scope.enableCustomFilter = true;
                    self.scope.string = "";
                    angular.forEach(listOfFilterAppointmentTypes, function (appt) {
                        self.scope.string += "apptTypes=";
                        self.scope.string += appt;
                        self.scope.string += '&';
                    });

                    self.scope.getCustomStackedChart(true);
                    getPieChartSvc.getFirstPieChart(self.scope.outerTab);

                })
                .error(function (data) {
                    $log.error("Filter activation unsuccessful")
                });
        };


        /* function to delete filter */
        self.deleteFilter = function (filterId) {

            $http.delete('/Clearvision/_api/EditSavedApptTypeCustomFilters/' + filterId)
                .success(function (data) {
                    self.scope.getCustomFilters();
                    showNotificationsSvc.notifySuccessTemplate('Filter deleted successfully');
                }).error(function (error) {
                    showNotificationsSvc.notifyErrorTemplate('Error deleting filter');
                });
        };


        /* function to open filter for edit */
        self.openEditFilter = function (startDate, endDate, filterId, filterName) {

            // clears the filter form first
            self.scope.clearFilter();
            self.scope.isCollapsed = false;
            self.scope.datepicker = startDate;
            self.scope.datepicker2 = endDate;
            self.scope.minEndDate = startDate;
            self.scope.maxStartDate = endDate;
            self.scope.existingFilterName = filterName;

            $http.get('/Clearvision/_api/EditSavedApptTypeCustomFilters/' + filterId)
                .success(function (data) {
                    self.scope.listOfSelectedAppointmentTypes = [];

                    angular.forEach(data.apptType, function (individualApptType) {
                        self.scope.listOfSelectedAppointmentTypes.push(individualApptType.name);
                        self.scope.listOfSelectedAppointmentTypesId.push(individualApptType.id);
                    });

                    angular.forEach(self.scope.apptTypes, function (apptType) {
                        if (self.scope.listOfSelectedAppointmentTypes.indexOf(apptType.name) > -1) {
                            apptType.naming = true;
                        }
                    });
                });

            self.scope.editFilterId = filterId;

            self.scope.showEditFilterButtons = true;
        };


    });