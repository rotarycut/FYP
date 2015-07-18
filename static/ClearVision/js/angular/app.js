var app = angular.module('calendarDemoApp', [
    'ui.calendar',
    'ui.bootstrap',
    'ngAside',
    'app.calendar',
    'app.sidebar']);


// Changing Angular interpolation from "{{ }}" to "[[ ]]" to prevent conflict with Django codes
app.config(function ($interpolateProvider) {
    $interpolateProvider.startSymbol('[[');
    $interpolateProvider.endSymbol(']]');
});