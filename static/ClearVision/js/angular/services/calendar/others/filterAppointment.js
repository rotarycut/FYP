var app = angular.module('filter.appointment', []);

app.service('filterAppointmentSvc', function () {

    var self = this;
    self.scope = {};

    self.getScope = function (scope) {
        self.scope = scope;
    };

    /* function to filter by appointment types */
    self.filterByAppointmentTypes = function (appointmentType, hidesTheRest) {

        switch (appointmentType) {
            case "Screening" :
                if (hidesTheRest) {

                    // add source if screening is not active
                    self.scope.addEventSource(self.scope.selectedDoctor.drAppointmentArray, self.scope.selectedDoctor.drScreening);

                    // remove source for pre evaluation and surgery
                    self.scope.removeEventSource(self.scope.selectedDoctor.drAppointmentArray, self.scope.selectedDoctor.drPreEval);
                    self.scope.removeEventSource(self.scope.selectedDoctor.drAppointmentArray, self.scope.selectedDoctor.drSurgery);

                    // change legend highlight
                    self.scope.toggleFilter('Screening', true);

                } else {

                    // toggle screening source
                    self.scope.addRemoveEventSource(self.scope.selectedDoctor.drAppointmentArray, self.scope.selectedDoctor.drScreening);

                    // change legend highlight
                    self.scope.toggleFilter('Screening');

                }
                break;

            case "Pre Evaluation":
                if (hidesTheRest) {

                    // add source if pre eval is not active
                    self.scope.addEventSource(self.scope.selectedDoctor.drAppointmentArray, self.scope.selectedDoctor.drPreEval);

                    // remove source for screening and surgery
                    self.scope.removeEventSource(self.scope.selectedDoctor.drAppointmentArray, self.scope.selectedDoctor.drScreening);
                    self.scope.removeEventSource(self.scope.selectedDoctor.drAppointmentArray, self.scope.selectedDoctor.drSurgery);

                    // change legend highlight
                    self.scope.toggleFilter('Pre Evaluation', true);

                } else {

                    // toggle pre eval source
                    self.scope.addRemoveEventSource(self.scope.selectedDoctor.drAppointmentArray, self.scope.selectedDoctor.drPreEval);

                    // change legend highlight
                    self.scope.toggleFilter('Pre Evaluation');

                }
                break;

            case "Surgery":
                if (hidesTheRest) {

                    // add source if surgery is not active
                    self.scope.addEventSource(self.scope.selectedDoctor.drAppointmentArray, self.scope.selectedDoctor.drSurgery);

                    // remove source for screening and pre eval
                    self.scope.removeEventSource(self.scope.selectedDoctor.drAppointmentArray, self.scope.selectedDoctor.drScreening);
                    self.scope.removeEventSource(self.scope.selectedDoctor.drAppointmentArray, self.scope.selectedDoctor.drPreEval);

                    // change legend highlight
                    self.scope.toggleFilter('Surgery', true);

                } else {

                    // toggle surgery source
                    self.scope.addRemoveEventSource(self.scope.selectedDoctor.drAppointmentArray, self.scope.selectedDoctor.drSurgery);

                    // change legend highlight
                    self.scope.toggleFilter('Surgery');

                }
                break;

            case "All":

                // add sources if appointment type is not active
                self.scope.addEventSource(self.scope.selectedDoctor.drAppointmentArray, self.scope.selectedDoctor.drScreening);
                self.scope.addEventSource(self.scope.selectedDoctor.drAppointmentArray, self.scope.selectedDoctor.drPreEval);
                self.scope.addEventSource(self.scope.selectedDoctor.drAppointmentArray, self.scope.selectedDoctor.drSurgery);

                // change legend highlight
                self.scope.toggleFilter('All');

                break;

        }
    };

    /* function to change filter legend underlined */
    self.toggleFilter = function (appointmentType, hidesTheRest) {

        switch (appointmentType) {
            case "Screening" :
                if (hidesTheRest) {
                    self.scope.legendScreenClicked = "legend-screen-clicked";
                    self.scope.legendEvalClicked = "legend-preEval";
                    self.scope.legendSurgeryClicked = "legend-surgery";
                    self.scope.screenIconChange = "fa fa-check-square";
                    self.scope.preEvalIconChange = "fa fa-stop";
                    self.scope.surgeryIconChange = "fa fa-stop";

                } else {
                    if (self.scope.legendScreenClicked == "legend-screen") {
                        self.scope.legendScreenClicked = "legend-screen-clicked";
                        self.scope.screenIconChange = "fa fa-check-square";
                    } else {
                        self.scope.legendScreenClicked = "legend-screen";
                        self.scope.screenIconChange = "fa fa-stop";
                    }
                }
                break;

            case "Pre Evaluation" :
                if (hidesTheRest) {
                    self.scope.legendScreenClicked = "legend-screen";
                    self.scope.legendEvalClicked = "legend-preEval-clicked";
                    self.scope.legendSurgeryClicked = "legend-surgery";
                    self.scope.preEvalIconChange = "fa fa-check-square";
                    self.scope.screenIconChange = "fa fa-stop";
                    self.scope.surgeryIconChange = "fa fa-stop";

                } else {
                    if (self.scope.legendEvalClicked == "legend-preEval") {
                        self.scope.legendEvalClicked = "legend-preEval-clicked";
                        self.scope.preEvalIconChange = "fa fa-check-square";
                    } else {
                        self.scope.legendEvalClicked = "legend-preEval";
                        self.scope.preEvalIconChange = "fa fa-stop";
                    }
                }
                break;

            case "Surgery" :
                if (hidesTheRest) {
                    self.scope.legendScreenClicked = "legend-screen";
                    self.scope.legendEvalClicked = "legend-preEval";
                    self.scope.legendSurgeryClicked = "legend-surgery-clicked";
                    self.scope.surgeryIconChange = "fa fa-check-square";
                    self.scope.preEvalIconChange = "fa fa-stop";
                    self.scope.screenIconChange = "fa fa-stop";

                } else {
                    if (self.scope.legendSurgeryClicked == "legend-surgery") {
                        self.scope.legendSurgeryClicked = "legend-surgery-clicked";
                        self.scope.surgeryIconChange = "fa fa-check-square";
                    } else {
                        self.scope.legendSurgeryClicked = "legend-surgery";
                        self.scope.surgeryIconChange = "fa fa-stop";
                    }
                }
                break;

            case "All" :
                self.scope.legendScreenClicked = "legend-screen-clicked";
                self.scope.legendEvalClicked = "legend-preEval-clicked";
                self.scope.legendSurgeryClicked = "legend-surgery-clicked";
                self.scope.screenIconChange = "fa fa-check-square";
                self.scope.preEvalIconChange = "fa fa-check-square";
                self.scope.surgeryIconChange = "fa fa-check-square";
        }
    };

});