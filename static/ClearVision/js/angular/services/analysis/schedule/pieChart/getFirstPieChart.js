angular.module('get.pieChart', [])
    .service('getPieChartSvc', function ($http) {

        var self = this;

        self.scope = {};

        self.getScope = function (scope) {
            self.scope = scope;
        };

        self.getFirstPieChart = function (type, month) {

            self.scope.outerTab = type;
            // if month input exist in argument, overwrites var currentMonth
            var currentMonth;

            // if the month listing chosen is not of current month
            if (self.scope.checkOtherMonthSelected()) {
                currentMonth = self.scope.currentMonth;
            } else {
                if (month == undefined) {
                    currentMonth = self.scope.getCurrentMonth();
                } else {
                    currentMonth = month;
                }
            }

            if (self.scope.innerTab == 'Appointment Type') {
                // if inner tab chosen is 'appointment type', outer tab can be anything
                var queryString;
                if (self.scope.enableCustomFilter) {
                    queryString = "/Clearvision/_api/ViewAppointmentAnalysisPiechartApptTypeTab/?piechartType=" + type + "&customFilter=True&" + self.scope.string + "startDate=" + self.scope.startDate + "&endDate=" + self.scope.endDate;
                } else {
                    queryString = '/Clearvision/_api/ViewAppointmentAnalysisPiechartApptTypeTab/?month=' + currentMonth + '&piechartType=' + type;
                }

                //console.log("Query: " + queryString);

                $http.get(queryString)
                    .success(function (data) {
                        //console.log(data);
                        if (Object.keys(data).length == 0) {
                            // there is zero cancelled appointment
                            //console.log("There is zero cancelled appointment");
                            self.scope.showNoAppointmentRemark = true;
                            self.scope.appointmentTypeChart([]);
                            self.scope.reasonsChart([]);
                            self.scope.marketingChannelChart([]);
                        } else {
                            // there is at least one cancelled appointment
                            //console.log("There is at least one cancelled appointment");
                            self.scope.showNoAppointmentRemark = false;
                            self.scope.appointmentTypeChart(data);
                            self.scope.reasonsChart([]);
                            self.scope.marketingChannelChart([]);
                        }
                    })
                    .error(function (data) {
                        //console.log("Error");
                    });

            } else if (self.scope.innerTab == 'Reasons') {
                // if inner tab chosen is 'reasons', outer tab can be anything
                var queryString;
                if (self.scope.enableCustomFilter) {
                    queryString = "/Clearvision/_api/ViewAppointmentAnalysisPiechartReasonsTab/?piechartType=" + type + "&customFilter=True&" + self.scope.string + "startDate=" + self.scope.startDate + "&endDate=" + self.scope.endDate;
                } else {
                    queryString = '/Clearvision/_api/ViewAppointmentAnalysisPiechartReasonsTab/?month=' + currentMonth + '&piechartType=' + type;
                }

                //console.log("Query: " + queryString);

                $http.get(queryString)
                    .success(function (data) {
                        if (Object.keys(data).length == 0) {
                            // there is zero cancelled appointment
                            //console.log("There is zero cancelled appointment");
                            self.scope.showNoAppointmentRemark = true;
                            self.scope.appointmentTypeChart([]);
                            self.scope.reasonsChart([]);
                            self.scope.marketingChannelChart([]);
                        } else {
                            // there is at least one cancelled appointment
                            //console.log("There is at least one cancelled appointment!!");
                            self.scope.showNoAppointmentRemark = false;
                            self.scope.appointmentTypeChart([]);
                            self.scope.reasonsChart(data);
                            self.scope.marketingChannelChart([]);
                        }
                    });

            } else if (self.scope.innerTab == 'Marketing Channels') {
                // if inner tab chosen is 'marketing channel', outer tab can be anything
                var queryString;
                if (self.scope.enableCustomFilter) {
                    queryString = "/Clearvision/_api/ViewAppointmentAnalysisPiechartMarketingChannelsTab/?piechartType=" + type + "&customFilter=True&" + self.scope.string + "startDate=" + self.scope.startDate + "&endDate=" + self.scope.endDate;
                } else {
                    queryString = '/Clearvision/_api/ViewAppointmentAnalysisPiechartMarketingChannelsTab/?month=' + currentMonth + '&piechartType=' + type;
                }

                //console.log("Query: " + queryString);

                $http.get(queryString)
                    .success(function (data) {
                        if (Object.keys(data).length == 0) {
                            // there is zero cancelled appointment
                            //("There is zero cancelled appointment");
                            self.scope.showNoAppointmentRemark = true;
                            self.scope.appointmentTypeChart([]);
                            self.scope.reasonsChart([]);
                            self.scope.marketingChannelChart([]);
                        } else {
                            // there is at least one cancelled appointment
                            //console.log("There is at least one cancelled appointment!!");
                            self.scope.showNoAppointmentRemark = false;
                            self.scope.appointmentTypeChart([]);
                            self.scope.reasonsChart([]);
                            self.scope.marketingChannelChart(data);
                        }
                    });
            }

        };

    });