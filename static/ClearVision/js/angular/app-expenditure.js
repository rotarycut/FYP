/**
 * Created by carinahu on 10/2/15.
 */
var appExpenditure = angular.module('app.expenditure', []);

appExpenditure.controller('MarketingExpenditureCtrl', function ($scope, $http, $modal,$route) {
    $scope.months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct","Nov","Dec"];
});
