'use strict';

directives.directive('mvPrecinctLineGraph', function () {
  return {
    templateUrl: 'partials/precinct_line_graph.html',
    restrict: 'E',
    scope: {
      precinctId: '=precinctId',
      yearFilter: '=yearFilter',
      violationFilter: '=violationFilter',
    },
    controller: directives.precinctLineGraph,
    controllerAs: 'precinctLineGraph',
    link: function postLink(scope, element, attrs) {
      // console.log(scope.precinctId, scope.yearFilter, scope.violationFilter);
    }
  };
});

directives.precinctLineGraph = function ($scope, $element, $attrs, $http) {

//console.log($scope.precinctId, $scope.yearFilter, $scope.violationFilter);
var getGraphData = function (precinctId, yearFilter, violationFilter) {
  $http({method: 'GET', url: '/api/precinct/' + precinctId + '?year=' + yearFilter + '&violation=' + violationFilter }).
  success(function(data, status, headers, config) {
    _.forEach(data.monthly_totals, function(month) {
      month.date = new Date(month.year, month.month_no);
    });

    $scope.graphData = data;
    setLineGraph($scope.graphData.monthly_totals);
  }).
  error(function(data, status, headers, config) {
  });
};

$scope.$watch('yearFilter', function(newValue, oldValue) {
  if(newValue && $scope.violationFilter) {
      getGraphData($scope.precinctId, $scope.yearFilter, $scope.violationFilter);
    }
  });

$scope.$watch('violationFilter', function(newValue, oldValue) {
  if(newValue && $scope.yearFilter) {
      getGraphData($scope.precinctId, $scope.yearFilter, $scope.violationFilter);
    }
  });

var setLineGraph = function (data) {
  var domainMax = d3.max(data, function(d) {
    return d3.max(d.violations, function (violation) {
      return violation.mtd;
    });
  });

  // var domainMin = d3.min(data, function(d) {
  //   return d3.min(d.violations, function (violation) {
  //     return violation.mtd;
  //   });
  // });

  var dateMax = d3.max(data, function(d) { return d.date; });
  var dateMin = d3.min(data, function(d) { return d.date; });
  var margin = {top: 0, right: 0, bottom: 0, left: (domainMax > 999) ? 35 : 25};
  var width = 350 - margin.left - margin.right;
  var height = 145 - margin.top - margin.bottom;
  var count = data.length;
  var x = d3.scale.ordinal().rangeRoundBands([0, width], 0.1);
  var timeScale = d3.time.scale().domain([dateMin, dateMax]).range([0, width]);
  var totalScale = null;

  var setScaleRange = function(min, max) {
    totalScale = d3.scale.linear().domain([0, domainMax]).nice();
    totalScale = totalScale.rangeRound([min, max]);
  };

  setScaleRange(height - 50, 5);

  x.domain(data.map(function(d) { return d.date; }));

  $scope.svg = $scope.svg || d3.select('.precinct_line_graph').append('svg');
  $scope.g = $scope.g || $scope.svg.append('g');

  var svg = $scope.svg;
  var g = $scope.g;

  svg.attr('width', width + margin.left + margin.right + 6)
  .attr('height', height + margin.top + margin.bottom + 6);

  g.attr('transform','translate(' + margin.left + ',' + margin.top + ')');

  var yAxis = d3.svg.axis()
  .scale(totalScale)
  .orient('left')
  .tickSize(1)
  .tickPadding(5)
  .ticks(5);

  var xTickCount = (data.length > 10) ? 10 : data.length;
  var xAxis = d3.svg.axis()
  .scale(timeScale)
  .tickSize(50,1)
  .tickFormat(d3.time.format('%m, %Y'))
  .ticks(xTickCount);

  var pathSegment = d3.svg.line()
  .x(function(d) { return timeScale(d.date); })
  .y(function(d) { return totalScale(d.violations[0].mtd); })
  .interpolate('linear');


  var lineGraph = g.selectAll('.violation-month-point')
  .data(data, function(d) {
    return d.date.getMonth() + '' + d.date.getYear() + '' + d.violations[0].name.replace(' ', '');
  });

  var lineGraphEnter = lineGraph.enter();

  $scope.path = $scope.path || g.append('path');

  $scope.path.attr('d', pathSegment(data))
  .attr('class', 'violation-month-line');

  lineGraphEnter.append('svg:circle')
  .attr('cx', function (d) { return timeScale(d.date); })
  .attr('cy', function (d) { return totalScale(d.violations[0].mtd); })
  .attr('r', 3)
  .attr('class','violation-month-point');

  var lineGraphUpdate = lineGraph.transition();

  lineGraphUpdate.attr('cx', function (d) { return timeScale(d.date); })
  .attr('cy', function (d) { return totalScale(d.violations[0].mtd); });

  //lineGraphUpdate.selectAll('.violation-month-line').attr('d', pathSegment(data));

  lineGraph.exit().remove();

  $scope.yAxis = $scope.yAxis || g.append('g').attr('class', 'y axis');
  $scope.xAxis = $scope.xAxis || g.append('g').attr('class', 'x axis').attr('transform','translate(0, ' + (height-49) + ')');

  $scope.yAxis.call(yAxis)
  .attr('transform','translate(0, 2)');


  $scope.xAxis.call(xAxis)
  .selectAll('text')
  .attr('x', 5)
  .attr('y', 0)
  .attr('transform', 'rotate(90)')
  .attr('dy','.25em')
  .style('text-anchor', 'start');

};

getGraphData($scope.precinctId, $scope.yearFilter, $scope.violationFilter);
};

directives.precinctLineGraph.$inject = ['$scope', '$element', '$attrs', '$http'];
