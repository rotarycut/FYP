var appPatientQueue = angular.module('app.patientQueue', []);

appPatientQueue.controller('QueueCtrl', function ($scope, $http) {

    $scope.CurrentDate = new Date();

    $scope.noshows = [
        {
            name: 'Leon',
            contact: '98208578',
            apptType: 'Pre-eval',
            doc: 'Dr. Ho',
            scheduledTime: '2015-08-25, 12:30:00',
            remarks: 'rescheduled to 28 Aug 3pm'
        },
        {
            name: 'Sherman',
            contact: '82301384',
            apptType: 'Surgery',
            doc: 'Dr. Ho',
            scheduledTime: '2015-08-29, 10:00:00',
            remarks: 'called, no answer'
        },
        {
            name: 'Zi-hua',
            contact: '80382942',
            apptType: 'Screening',
            doc: '',
            scheduledTime: '2015-09-02, 14:30:00',
            remarks: ''
        }
    ];

    $scope.totalItems = 24;
    $scope.currentPage = 1;

    $scope.setPage = function (pageNo) {
        $scope.currentPage = pageNo;
    };

    $scope.orderByField = 'timeBucket__start';
    $scope.reverseSort = false;

    $scope.getTodayAppointments = function () {

        $http.get('/Clearvision/_api/ViewTodayPatients/')
            .success(function (data) {
                $scope.patientList = data;
                console.log("OK");
            });
    };

    $scope.getPatientQueue = function () {

        $http.get('/Clearvision/_api/ViewPatientQueue/')
            .success(function (data) {
                $scope.queueList = data;
            });
    };

    $scope.sortByField = function (field) {
        $scope.orderByField = field;
        $scope.reverseSort = !$scope.reverseSort;
    };

    $scope.addToQueue = function (apptId, apptType, clinic, doctor, timeBucket, patientContact, hasAttended) {

        if (doctor === "Dr Ho") {
            doctor = 2;
        } else {
            doctor = 1;
        }

        $scope.postToQueue = {
            "apptId": apptId,
            "apptType": apptType,
            "clinic": clinic,
            "doctor": doctor,
            "timeBucket": timeBucket,
            "patient": patientContact,
            "attended": hasAttended
        };

        $http.post('/Clearvision/_api/ViewTodayPatients/', $scope.postToQueue)
            .success(function (result) {
                console.log("Added to queue successfully.")
                $scope.getTodayAppointments();
                $scope.getPatientQueue();
            });

        console.log($scope.postToQueue);

    };
    $scope.showQueue = true;
    $scope.shrinkLeftTable = true;
    $scope.decideShowQueue = function (shouldShow) {
        $scope.showQueue = shouldShow;
        $scope.shrinkLeftTable = shouldShow;
    };

    $scope.revertFromQueue = function (apptId, patientContact) {

        $http.post('/Clearvision/_api/ViewPatientQueue/', {
            "apptId": apptId,
            "patient": patientContact
        })
            .success(function (data) {
                console.log("Success reverting");
                $scope.getTodayAppointments();
                $scope.getPatientQueue();
            })
            .error(function (data) {
                console.log("Error reverting");
            });
    };

    /*$scope.patientList = [
     {
     "timeBucket__start": "09:30:00",
     "patients__gender": "Male",
     "doctor__name": "Dr Ho",
     "patients": "90213775",
     "patients__name": "Bond",
     "apptType": "Screening"
     },
     {
     "timeBucket__start": "15:00:00",
     "patients__gender": "Male",
     "timeBucket": 3397,
     "doctor__name": "Dr Ho",
     "timeBucket__date": "2015-08-27",
     "patients": "90421045",
     "patients__name": "Donald",
     "id": 26,
     "apptType": "Surgery"
     },
     {
     "timeBucket__start": "15:00:00",
     "patients__gender": "Male",
     "timeBucket": 3397,
     "doctor__name": "Dr Ho",
     "timeBucket__date": "2015-08-27",
     "patients": "90747285",
     "patients__name": "Ho",
     "id": 26,
     "apptType": "Surgery"
     },
     {
     "timeBucket__start": "15:00:00",
     "patients__gender": "Male",
     "timeBucket": 3397,
     "doctor__name": "Dr Ho",
     "timeBucket__date": "2015-08-27",
     "patients": "96737432",
     "patients__name": "Lane",
     "id": 26,
     "apptType": "Surgery"
     },
     {
     "timeBucket__start": "13:30:00",
     "doctor__name": "Dr Ho",
     "patients": "90213775",
     "patients__name": "Bond",
     "apptType": "Screening"
     },
     {
     "timeBucket__start": "08:30:00",
     "doctor__name": "Dr Ho",
     "patients": "90213775",
     "patients__name": "Bond",
     "apptType": "Pre Evaluation"
     },
     {
     "timeBucket__start": "13:30:00",
     "doctor__name": "Dr Ho",
     "patients": "90213775",
     "patients__name": "Bond",
     "apptType": "Screening"
     },
     {
     "timeBucket__start": "09:30:00",
     "doctor__name": "Dr Ho",
     "patients": "90213775",
     "patients__name": "Song",
     "apptType": "Pre Evaluation"
     },
     {
     "timeBucket__start": "07:30:00",
     "doctor__name": "Dr Ho",
     "patients": "90213775",
     "patients__name": "Song",
     "apptType": "Pre Evaluation"
     },
     {
     "timeBucket__start": "11:30:00",
     "doctor__name": "Dr Ho",
     "patients": "90213775",
     "patients__name": "Song",
     "apptType": "Pre Evaluation"
     }
     ];*/


});
