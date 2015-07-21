var app = angular.module('calendarDemoApp', [
    'ui.calendar',
    'ui.bootstrap',
    'app.calendar',]);


// Changing Angular interpolation from "{{ }}" to "[[ ]]" to prevent conflict with Django codes
app.config(function ($interpolateProvider) {
    $interpolateProvider.startSymbol('[[');
    $interpolateProvider.endSymbol(']]');
});

//remove ng-scope and ng-bining class from html
/*app.config(['$compileProvider', function ($compileProvider) {
    $compileProvider.debugInfoEnabled(false);
}]);*/