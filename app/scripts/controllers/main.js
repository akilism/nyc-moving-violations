'use strict';

var getPrecinctViolations = function (precinct, year) {
  var violations = [];

    //loop over all years.
    if(year === 'A') {
      _.forEach(precinct.totals, function(y) {
        violations = violations.concat(_.keys(y));
      });

      return _.unique(violations);
    }

    return _.keys(precinct.totals[year]);
  };

  var getDistinctViolations = function (precincts) {
    //build a set of violations.
    var violations = [];

    _.forEach(precincts, function (precinct) {
      violations = violations.concat(getPrecinctViolations(precinct, 'A'));
    });

    return _.unique(violations);
  };


  angular.module('nycMovingViolationsApp')
  .controller('MainCtrl', ['$scope', '$http', 'precincts', function ($scope, $http, precincts) {
    precincts = _.sortBy(precincts, 'id');
    $scope.precincts = precincts;
    $scope.violations = getDistinctViolations(precincts);
    $scope.yearFilter = 'A';
    $scope.violationFilter = null;
    $scope.filteredData = [];


    var refilter = function () {
      if($scope.violationFilter && $scope.yearFilter) {
        $scope.filteredData = filterYearlyData($scope.precincts, $scope.yearFilter, $scope.violationFilter);
      }
    };

    var getAllPrecinctViolation = function (precinct, violation) {
        //Save the year to date and month to date totals for all years.
        var ytdTtl = 0,
        mtdTtl = 0;

        _.forEach(precinct.totals, function (year) {
          if (year[violation]) {
            ytdTtl += year[violation].ytd_ttl;
            mtdTtl += year[violation].mtd_ttl;
          }
        });

        return {
          'id': precinct.id,
          'name': precinct.name,
          'ytd_ttl': ytdTtl,
          'mtd_ttl': mtdTtl
        };
      };

      var filterPrecinct = function(precinct, year, violation) {

        if (year === 'A') {
          return getAllPrecinctViolation(precinct, violation);
        }

        if (!precinct.totals.hasOwnProperty(year) || !precinct.totals[year].hasOwnProperty(violation)) { return; }

        return {
          'id': precinct.id,
          'name': precinct.name,
          'ytd_ttl': precinct.totals[year][violation].ytd_ttl,
          'mtd_ttl': precinct.totals[year][violation].mtd_ttl
        };
      };

      var filterYearlyData = function(precincts, year, violation) {
        var filteredData = [];

        _.forEach(precincts, function (precinct) {
          filteredData = filteredData.concat(filterPrecinct(precinct, year, violation));
        });

        return filteredData;
      };

      var highlightButton = function ($event) {
        var $$target = $($event.target);
        $$target.toggleClass('btn-filter-active');
        $$target.siblings().removeClass('btn-filter-active');
      };

      $scope.filterYear = function ($event, year) {
        highlightButton($event);
        hideJumbotron();
        $scope.yearFilter = (year === $scope.yearFilter) ? null : year;
        refilter();
      };

      $scope.filterViolation = function ($event, violation) {
        highlightButton($event);
        hideJumbotron();
        $scope.violationFilter = (violation === $scope.violationFilter) ? null : violation;
        refilter();
      };

      var hideJumbotron = function () {
        var $$jumbotron = $('.jumbotron');

        if($$jumbotron.hasClass('vanish')) { return; }
        $$jumbotron.addClass('vanish');

        $('.map-wrapper').css('display', 'block');
      };

      $scope.violationFilter = $scope.violations[0];
      refilter();

    }]);





