angular.module('get.customStackedChart', [])
    .service('getCustomStackedChartSvc', function ($http, getPieChartSvc) {

        var self = this;

        self.scope = {};

        self.getScope = function (scope) {
            self.scope = scope;
        };

        self.getCustomStackedChart = function (isSavedFilter) {

            // if it is coming from a saved filter
            if (isSavedFilter) {

                $http.get('/Clearvision/_api/ViewAppointmentAnalysisStackedChart/?customFilter=True&' + self.scope.string + 'startDate=' + self.scope.startDate + '&endDate=' + self.scope.endDate)
                    .success(function (data) {
                        self.scope.stackedCustomChartData = data;
                        //console.log(data);
                        self.scope.showStackedChart(self.scope.stackedCustomChartData);
                    });

            } else {

                // make sure that all the fields in the filter are filled
                if (self.scope.datepicker == undefined || self.scope.datepicker2 == undefined || self.scope.listOfSelectedAppointmentTypes.length == 0) {

                    // not all the filter fields are filled
                    self.scope.openErrorModal();

                } else {

                    // all the filter fields are filled

                    // upon custom filter, by default sort option will be set to turn up
                    self.scope.sortSelected = "Turn Up";

                    // retrieve start date and end date
                    self.scope.startDate = self.scope.getFormattedDate(self.scope.datepicker);
                    self.scope.endDate = self.scope.getFormattedDate(self.scope.datepicker2);

                    // prepare the concatenated string consisting the list of appointment types
                    self.scope.string = "";
                    angular.forEach(self.scope.listOfSelectedAppointmentTypes, function (appt) {
                        self.scope.string += "apptTypes=";
                        self.scope.string += appt;
                        self.scope.string += '&';
                    });

                    // make the custom filter call to the backend
                    $http.get('/Clearvision/_api/ViewAppointmentAnalysisStackedChart/?customFilter=True&' + self.scope.string + 'startDate=' + self.scope.startDate + '&endDate=' + self.scope.endDate)
                        .success(function (data) {
                            self.scope.stackedCustomChartData = data;
                            //console.log(data);
                            self.scope.showStackedChart(self.scope.stackedCustomChartData);
                        });

                    // get the first pie chart for the custom filter
                    getPieChartSvc.getFirstPieChart(self.scope.outerTab);

                    // set status of custom filter to true
                    self.scope.enableCustomFilter = true;

                }
            }
        };


    });