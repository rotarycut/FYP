angular.module('get.customStackedChart', [])
    .service('getCustomStackedChartSvc', function ($http, getPieChartSvc) {

        var self = this;

        self.scope = {};

        self.getScope = function (scope) {
            self.scope = scope;
        };

        self.getCustomStackedChart = function (currentMonth, isSavedFilter) {

            // if it is coming from a saved filter
            if (isSavedFilter) {

                $http.get('/Clearvision/_api/ViewAppointmentAnalysisStackedChart/?customFilter=True&' + self.scope.string + 'startDate=' + self.scope.startDate + '&endDate=' + self.scope.endDate)
                    .success(function (data) {
                        self.scope.stackedCustomChartData = data;
                        //console.log(data);
                        self.scope.showStackedChart(self.scope.stackedCustomChartData);
                    });

            } else {

                if (self.scope.datepicker == undefined || self.scope.datepicker2 == undefined || self.scope.listOfSelectedAppointmentTypes.length == 0) {

                    self.scope.openErrorModal();

                } else {

                    self.scope.sortSelected = "Turn Up";
                    self.scope.startDate = self.scope.getFormattedDate(self.scope.datepicker);
                    self.scope.endDate = self.scope.getFormattedDate(self.scope.datepicker2);

                    //console.log(self.scope.listOfSelectedAppointmentTypes);
                    //console.log(self.scope.string);

                    $http.get('/Clearvision/_api/ViewAppointmentAnalysisStackedChart/?customFilter=True&' + self.scope.string + 'startDate=' + self.scope.startDate + '&endDate=' + self.scope.endDate)
                        .success(function (data) {
                            self.scope.stackedCustomChartData = data;
                            //console.log(data);
                            self.scope.showStackedChart(self.scope.stackedCustomChartData);
                        });

                    self.scope.string = "";
                    angular.forEach(self.scope.listOfSelectedAppointmentTypes, function (appt) {
                        self.scope.string += "apptTypes=";
                        self.scope.string += appt;
                        self.scope.string += '&';
                    });

                    getPieChartSvc.getFirstPieChart(self.scope.outerTab);
                    self.scope.enableCustomFilter = true;

                }
            }
        };


    });