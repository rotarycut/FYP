var appPatientQueue = angular.module('app.patientQueue', []);

appPatientQueue.controller('QueueCtrl', function ($scope) {

    $scope.CurrentDate = new Date();

    $scope.patients = [
        {
            index: '1',
            name: 'Carina',
            contact: '98208578',
            apptType: 'Pre-eval',
            doc: 'Dr. Ho',
            scheduledTime: '12:30:00',
            timeIn: '12:30:00',
            timeOut: '12:30:00',
        },
        {
            index: '2',
            name: 'Amabel',
            contact: '82301384',
            apptType: 'Surgery',
            doc: 'Dr. Ho',
            scheduledTime: '14:30:00',
            timeIn: '12:30:00',
            timeOut: '12:30:00',
        },
        {
            index: '3',
            name: 'Angelin',
            contact: '80382942',
            apptType: 'Screening',
            doc: '',
            scheduledTime: '09:30:00',
            timeIn: '12:30:00',
            timeOut: '12:30:00',
        }
    ];

    $scope.noshows = [
        {
            name: 'Leon',
            contact: '98208578',
            apptType: 'Pre-eval',
            doc: 'Dr. Ho',
            scheduledTime: '2015-08-25, 12:30:00',
            remarks:'rescheduled to 28 Aug 3pm'
        },
        {
            name: 'Sherman',
            contact: '82301384',
            apptType: 'Surgery',
            doc: 'Dr. Ho',
            scheduledTime: '2015-08-29, 10:00:00',
            remarks:'called, no answer'
        },
        {
            name: 'Zi-hua',
            contact: '80382942',
            apptType: 'Screening',
            doc: '',
            scheduledTime: '2015-09-02, 14:30:00',
            remarks:''
        }
    ];

    $scope.totalItems = 24;
    $scope.currentPage = 1;

    $scope.setPage = function (pageNo) {
        $scope.currentPage = pageNo;
    };


});

