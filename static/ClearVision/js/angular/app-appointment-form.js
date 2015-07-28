var appAppointmentForm = angular.module('app.appointment.form', []);

appAppointmentForm.controller('AppointmentFormController', function ($scope) {

    /* Start of date picker codes */
    $scope.datepickers = {
        showDatePicker: false
    };
    $scope.disabled = function(date, mode) {
    return ( mode === 'day' && ( date.getDay() === 0 || date.getDay() === 7 ) );
    };

    $scope.today = function () {
        $scope.datePickerCalendar = new Date();
    };
    $scope.today();

    $scope.clear = function () {
        $scope.datePickerCalendar = null;
    };

    $scope.toggleMin = function () {
        $scope.minDate = $scope.minDate ? null : new Date();
    };
    $scope.toggleMin();

    $scope.open = function ($event, which) {
        $event.preventDefault();
        $event.stopPropagation();

        $scope.datepickers[which] = true;
    };

    $scope.dateOptions = {
        formatYear: 'yy',
        startingDay: 1,
        showWeeks: 'false'
    };

    $scope.formats = ['dd-MMMM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
    $scope.format = $scope.formats[0];
    /* End of date picker codes */


    $scope.listOfAppointmentTypes = ["Pre-Evaluation", "Lasik Surgery", "Screening", "Follow-up"];

    $scope.listOfAppointmentTimings = ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00"];

    $scope.listOfMarketingChannels = ["Email", "Friend", "Facebook Advertisement", "Clearvision Website"];

    $scope.listOfTimeslotPatients = ["Amabel Lau", "Leon Lim", "Sherman Yong"];

    $scope.clearForm = function () {
        $scope.appointmentType = "";
        $scope.apptDateTime = "";
        $scope.appointmentTime = "";
        $scope.patientName = "";
        $scope.patientContact = "";
        $scope.doctorAssigned = "";
        $scope.marketingChannel = "";
        $scope.appointmentRemarks = "";
    };


});