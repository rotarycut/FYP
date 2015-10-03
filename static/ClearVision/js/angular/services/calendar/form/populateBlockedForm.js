angular.module('populate.blockedForm', [])
    .service('populateBlockedFormSvc', function () {

        var self = this;

        self.scope = {};

        self.getScope = function (scope) {
            self.scope = scope;
        };

        self.populateBlockForm = function (blockedAppointment) {

            self.scope.form.showButtons.createBlockForm = false;
            self.scope.form.showButtons.editBlockForm = true;

            var tStartIndex = blockedAppointment.start.indexOf("T");
            var lastStartColon = blockedAppointment.start.lastIndexOf(":");
            var startDate = blockedAppointment.start.substring(0, tStartIndex);
            var startTime = blockedAppointment.start.substring(tStartIndex + 1, lastStartColon);

            var tEndIndex = blockedAppointment.end.indexOf("T");
            var lastEndColon = blockedAppointment.end.lastIndexOf(":");
            var endDate = blockedAppointment.end.substring(0, tEndIndex);
            var endTime = blockedAppointment.end.substring(tEndIndex + 1, lastEndColon);

            self.scope.blockFields.doctorToBlock = self.scope.listOfDoctors[blockedAppointment.doctor__id - 1];
            self.scope.blockFields.blockDateStart = startDate;
            self.scope.blockFields.blockTimeStart = startTime;
            self.scope.blockFields.blockDateEnd = endDate;
            self.scope.blockFields.blockTimeEnd = endTime;
            self.scope.blockFields.blockFormRemarks = blockedAppointment.remarks;

            blockedAppointment.blockDateStart = startDate;
            blockedAppointment.blockTimeStart = startTime;
            blockedAppointment.blockDateEnd = endDate;
            blockedAppointment.blockTimeEnd = endTime;

            self.scope.blockFields.originalBlockForm = blockedAppointment;

        };

    });