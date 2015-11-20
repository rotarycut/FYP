angular.module('populate.blockedForm', [])
    .service('populateBlockedFormSvc', function () {

        var self = this;

        self.scope = {};

        self.getScope = function (scope) {
            self.scope = scope;
        };

        self.populateBlockForm = function (blockedAppointment) {

            self.scope.form.showBlcokButtons.createBlockForm = false;
            self.scope.form.showBlcokButtons.editBlockForm = true;

            var startCommaIndex = blockedAppointment.start.indexOf(",");
            var startSpaceIndex = blockedAppointment.start.indexOf(" ");
            var startLastColonIndex = blockedAppointment.start.lastIndexOf(":");
            var startDate = blockedAppointment.start.substring(0, startCommaIndex);
            var startTime = blockedAppointment.start.substring(startSpaceIndex + 1, startLastColonIndex);

            var endCommaIndex = blockedAppointment.end.indexOf(",");
            var endSpaceIndex = blockedAppointment.end.indexOf(" ");
            var endLastColonIndex = blockedAppointment.end.lastIndexOf(":");
            var endDate = blockedAppointment.end.substring(0, endCommaIndex);
            var endTime = blockedAppointment.end.substring(endSpaceIndex + 1, endLastColonIndex);

            self.scope.blockFields.doctorToBlock = self.scope.listOfDoctors[blockedAppointment.doctor__id - 1];
            self.scope.blockFields.blockDateStart = new Date(startDate);
            self.scope.blockFields.blockTimeStart = startTime;
            self.scope.blockFields.blockDateEnd = new Date(endDate);
            self.scope.blockFields.blockTimeEnd = endTime;
            self.scope.blockFields.blockFormRemarks = blockedAppointment.remarks;
            self.scope.blockFields.blockFormId = blockedAppointment.id;

            blockedAppointment.blockDateStart = new Date(startDate);
            blockedAppointment.blockTimeStart = startTime;
            blockedAppointment.blockDateEnd = new Date(endDate);
            blockedAppointment.blockTimeEnd = endTime;

            self.scope.blockFields.originalBlockForm = blockedAppointment;

        };

    });