/* function to create appointment */
$scope.postAppointment = function () {

    var formattedDate = $scope.getFormattedDate($scope.fields.appointmentDate);

    if ($scope.fields.appointmentRemarks === undefined) {
        $scope.fields.appointmentRemarks = "";
    }

    if ($scope.fields.waitingDate !== undefined) {
        var formattedWaitingDate = $scope.getFormattedDate($scope.fields.waitingDate);
    }

    $http.post('/Clearvision/_api/appointmentsCUD/', {
        "apptType": $scope.fields.appointmentType,
        "date": formattedDate,
        "docID": $scope.fields.doctorAssigned,
        "clinicID": 1,
        "contact": $scope.fields.patientContact,
        "name": $scope.fields.patientName,
        "gender": "Male",
        "channelID": "1",
        "time": $scope.fields.appointmentTime,
        "remarks": $scope.fields.appointmentRemarks,
        "waitingListFlag": $scope.fields.waitingList,
        "tempDate": formattedWaitingDate,
        "tempTime": $scope.fields.waitingTime
    })
        .success(function (data) {
            console.log("Successful with http post");
            console.log(data);

            var event = data;

            switch ($scope.fields.appointmentType) {

                case "Screening":
                    var appointmentIndex = 0;
                    angular.forEach($scope.drHoScreenings.events, function (screeningAppointment) {
                        if (screeningAppointment.start === event.start) {
                            $scope.drHoScreenings.events.splice(appointmentIndex, 1);

                        }
                        appointmentIndex++;
                    });
                    $scope.drHoScreenings.events.push(event);
                    break;

                case "Pre Evaluation":
                    var appointmentIndex = 0;
                    angular.forEach($scope.drHoPreEvaluations.events, function (preEvaluationAppointment) {
                        if (preEvaluationAppointment.start === event.start) {
                            $scope.drHoPreEvaluations.events.splice(appointmentIndex, 1);

                        }
                        appointmentIndex++;
                    });
                    $scope.drHoPreEvaluations.events.push(event);
                    break;

                case "Surgery":
                    var appointmentIndex = 0;
                    angular.forEach($scope.drHoSurgeries.events, function (surgeryAppointment) {
                        if (surgeryAppointment.start === event.start) {
                            $scope.drHoSurgeries.events.splice(appointmentIndex, 1);

                        }
                        appointmentIndex++;
                    });

                    $scope.drHoSurgeries.events.push(event);
                    break;
            }

        })

        .error(function (data) {
            console.log("Error with http post");
        });
};