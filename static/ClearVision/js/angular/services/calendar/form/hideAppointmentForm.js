angular.module('hide.form', [])
    .service('hideFormSvc', function (clearFormSvc, disableIScheduleSvc, $timeout) {

        var self = this;
        self._scope = {};

        self.getScope = function (scope) {
            self._scope = scope;
        };


        self.hideForm = function () {

            self._scope.form.showFormBtns = true;
            self._scope.scaleDownCalendar = false;

            self._scope.form.showForm = false;
            self._scope.form.showBlockForm = false;
            //$scope.disableISchedule();
            clearFormSvc.clearForm();
            disableIScheduleSvc.disableISchedule();
            //$scope.showHeatMap = false;
            self._scope.showWaitingDate = false;
            self._scope.showWaitingTime = false;

            // refresh all doctors to default
            self._scope.getAllDoctors();

            $timeout(function () {

                for (var field in self._scope.form.showFields) {
                    self._scope.form.showFields[field] = true;
                }

                for (var field in self._scope.form.disableFields) {
                    self._scope.form.disableFields[field] = false;
                }

                for (var field in self._scope.form.showButtons) {
                    self._scope.form.showButtons[field] = false;
                }

                angular.forEach(self._scope.allDoctorsVariables, function (doctorCalendar) {
                    doctorCalendar.disable = false;
                });

                self._scope.form.showButtons['addAndBlock'] = true;

            }, 600);

        };


        self.hideBlockForm = function () {

            self._scope.form.showFormBtns = true;
            self._scope.scaleDownCalendar = false;

            self._scope.form.showForm = false;
            self._scope.form.showBlockForm = false;

            self._scope.form.showBlcokButtons.createBlockForm = true;
            self._scope.form.showBlcokButtons.editBlockForm = false;

            clearFormSvc.clearBlockForm();

            $timeout(function () {

                for (var field in self._scope.form.showFields) {
                    self._scope.form.showFields[field] = true;
                }

                self._scope.form.showButtons['addAndBlock'] = true;

            }, 600);

        }

    });