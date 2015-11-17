angular.module('get.stackedChart', [])
    .service('getStackedChartSvc', function ($http) {

        var self = this;

        self.scope = {};

        self.getScope = function (scope) {
            self.scope = scope;
        };

        self.getStackedChart = function (currentYear, currentMonth) {

            $http.get('/Clearvision/_api/ViewAppointmentAnalysisStackedChart/?year=' + currentYear + '&month=' + currentMonth)
                .success(function (data) {
                    self.scope.stackedChartData = data;
                    self.scope.showStackedChart(self.scope.stackedChartData);
                });
        };

        self.showStackedChart = function (data) {

            self.scope.stackedChart = c3.generate({
                bindto: '#stacked',
                padding: {
                    top: 30,
                    right: 50,
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
                        min: 0,
                        padding: {top: 0, bottom: 0}
                    }
                },
                data: {
                    json: data,
                    keys: {
                        // x: 'name', // it's possible to specify 'x' when category axis
                        x: 'apptType',
                        value: ['Turn Up', 'No Show', 'Cancelled']
                    },
                    type: 'bar',
                    groups: [
                        ['Turn Up', 'No Show', 'Cancelled']
                    ],
                    order: null
                },
                tooltip: {
                    show: true
                }
            });
        };

    });