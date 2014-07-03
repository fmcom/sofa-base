angular.module('sdk.directives.ccCheckBox', ['src/directives/ccCheckBox/cc-checkbox.tpl.html']);

angular.module('sdk.directives.ccCheckBox')
    .directive('ccCheckBox', function () {

        'use strict';

        var instanceCount = 0;

        return {
            restrict: 'E',
            replace: true,
            scope: {
                label: '=?',
                value: '=?',
                preventClicks: '@?',
                onClick: '=?'
            },
            controller: function ($scope) {
                return {
                    setOnClick: function (fn) {
                        $scope.onClick = fn;
                    }
                };
            },
            templateUrl: 'src/directives/ccCheckBox/cc-checkbox.tpl.html',
            link: function (scope, $element) {
                instanceCount++;
                scope.id = instanceCount;

                var clickHandler = function () {
                    $element.bind('click', function (e) {
                        if (scope.preventClicks && e.target.nodeName === scope.preventClicks.toUpperCase()) {
                            e.preventDefault();
                        }
                        if (angular.isFunction(scope.onClick)) {
                            scope.onClick(e);
                        }
                    });
                };

                if (scope.preventClicks || scope.onClick) {
                    clickHandler();
                }

            }
        };
    });
