'use strict';

var services = angular.module('nycMovingViolationsApp.services');

var host = 'nycMovingViolationsApp';

var getPath = function (path) {
  if (path === '/') { return '/api/precincts/'; }
  return '/api' + path;
};


var getStoredDataset = function () {
  return (localStorage[host]) ? JSON.parse(localStorage[host]) : null;
};

services.factory('Loader', ['$http', '$q', function ($http, $q) {
  return function (path) {
    if (path === '/') {
        //check localstorage for totals.
        //To clear:
        // localStorage.removeItem('nycMovingViolationsApp');
        var storedData = getStoredDataset();
        if (storedData) {
          console.log('returning stored data.');
          return storedData;
        }
      }

      var deferred = $q.defer();
      var apiPath = getPath(path);

      var getDefer = function () { $http.get(apiPath).success(function(data) {
        if (path === '/') {
            //Store the data in localstorage.
            console.log('saving to localStorage');
            //appStorage = JSON.stringify(data);
            localStorage[host] = JSON.stringify(data);
          }

          deferred.resolve(data);
        });

      return deferred.promise;
    };

    return getDefer();
  };
}]);
