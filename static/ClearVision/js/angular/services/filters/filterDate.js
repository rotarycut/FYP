angular.module('filterDate', [])

    .filter('dateFilter', function ($filter) {

        return function (dateObject, dateFormat) {

            if (dateObject == null) {

                return "";
            }

            var formattedDate;

            if (dateFormat == 'longDate') {
                formattedDate = $filter('date')(dateObject, 'd MMMM y');
            }

            else if (dateFormat == 'shortDate') {
                formattedDate = $filter('date')(dateObject, 'yyyy-MM-dd');
            }

            return formattedDate;
        }

    });