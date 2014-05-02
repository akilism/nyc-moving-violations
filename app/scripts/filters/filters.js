'use strict';

var filters = angular.module('nycMovingViolationsApp.filters', ['ngResource']);

filters.filter('yearDisplay', function () {
  return function (input) {
    if(input === 'A') { return 'All'; }
    return input;
  };
});
