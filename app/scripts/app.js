'use strict';

angular.module('nycMovingViolationsApp', [
  'ngCookies',
  'ngResource',
  'ngSanitize',
  'ngRoute',
  'nycMovingViolationsApp.services',
  'nycMovingViolationsApp.filters',
  'nycMovingViolationsApp.directives'
  ])
.config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {
  $routeProvider
  .when('/', {
    templateUrl: 'partials/main',
    controller: 'MainCtrl',
    resolve: {
      precincts:['Loader', '$location', function(Loader, $location) {
        return Loader($location.$$path);
      }
      ]}
    })
  .otherwise({
    redirectTo: '/'
  });
  $locationProvider.html5Mode(true);
}]);

var directives = angular.module('nycMovingViolationsApp.directives', []);
var services = angular.module('nycMovingViolationsApp.services', []);
var filters = angular.module('nycMovingViolationsApp.filters', []);
