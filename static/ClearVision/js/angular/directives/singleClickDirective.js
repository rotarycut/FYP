/* directive for single click used in filter feature */

angular.module('single.click', [])
    .directive('singleclick', ['$parse', function ($parse) {
        return {
            restrict: 'A',
            link: function (scope, element, attr) {
                var fn = $parse(attr['singleclick']);
                var delay = 300, clicks = 0, timer = null;
                element.on('click', function (event) {
                    clicks++;  //count clicks
                    if (clicks === 1) {
                        timer = setTimeout(function () {
                            scope.$apply(function () {
                                fn(scope, {$event: event});
                            });
                            clicks = 0; //after action performed, reset counter
                        }, delay);
                    } else {
                        clearTimeout(timer); //prevent single-click action
                        clicks = 0; //after action performed, reset counter
                    }
                });
            }
        };
    }]);