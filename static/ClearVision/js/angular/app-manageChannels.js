var appChannels = angular.module('app.managechannels', []);

appChannels.controller('ManageChannelsCtrl', function ($scope, $http) {

    $scope.listOfChannelsSpent = [
        {
            name: 'Blogger DreaChong',
            cost: 1000,
            date: '2015-08-21'

        },
        {
            name: 'Facebook',
            cost: 300,
            date: '2015-11-03'
        },
        {
            name: 'Lasik Website',
            cost: 500,
            date: '2015-11-07'
        },
        {
            name: 'Wanbao',
            cost: 600,
            date: '2015-11-12'
        }
    ];


});
