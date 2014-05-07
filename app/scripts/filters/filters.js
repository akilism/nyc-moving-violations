'use strict';

var filters = angular.module('nycMovingViolationsApp.filters', ['ngResource']);

filters.filter('yearDisplay', function () {
  return function (input) {
    if(input === 'A') { return 'All'; }
    return input;
  };
});

filters.filter('violationDisplay', function () {
  return function (input) {
    if (input.indexOf('(') === -1) { return input; }

    return input.substring(0, input.indexOf('(')).trim();
  };
});
