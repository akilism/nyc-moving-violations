'use strict';

directives.directive('mvCityMap', function () {
  return {
    templateUrl: 'partials/citymap.html',
    restrict: 'E',
    controller: directives.cityMap,
    controllerAs: 'cityMap'
  };
});

directives.cityMap = function ($scope, $element, $attrs, $http) {
  $scope.activePrecincts = [];

  $http({method: 'GET', url: '/api/precinct-geo'}).
  success(function (data, status, headers, config) {
    $scope.precinctGeoJson = data;
    // setCityMap($scope.precinctGeoJson);
    // setMap('cityMap', data.features);
  }).
  error(function (data, status, headers, config) {
  });

  $scope.$watch('violationFilter', function (newValue, oldValue) {
    if(newValue && $scope.yearFilter) {
      setCityMap($scope.precinctGeoJson);
    }
  });

  $scope.$watch('yearFilter', function (newValue, oldValue) {
    if(newValue && $scope.violationFilter) {
      setCityMap($scope.precinctGeoJson);
    }
  });


  //Some helper map functions.

  // Apply highlight to precinct shapes on mouseover.
  var highlightPrecinct = function (elem) {
    elem.classList.add('highlighted-path');
  };

  // Remove highlight on mouseout.
  var removePrecinctHighlight = function (elem) {
    elem.classList.remove('highlighted-path');
  };

  var mapPrecinctId = function (precinctId, from) {
    var mappedId = '';
    switch(from) {
      case 'pediacities':
        mappedId += precinctId;
        if(mappedId.length === 1) {
          mappedId = '00' + mappedId;
        } else if(mappedId.length === 2) {
          mappedId = '0' + mappedId;
        }
        break;
      case 'city':
        break;
    }

    return mappedId;
  };



  // Set event handlers on shapes.
  var setPrectinct = function (feature, layer) {
    //   layer.bindPopup(zipCodes[i].zip_code + '<br>Total: $' + zipCodes[i].total.toMoney() +
    //       '<br>' + nycCampaignFinanceApp.addOrdinal(position) + ' in contributions.' + '<br> Contributors: ' + zipCodes[i].count);
      layer.on('mouseover', highlightPrecinct);
      layer.on('mouseout', removePrecinctHighlight);
      layer.setStyle({
        color: 'rgb(0, 0, 0)',
        weight: 1,
        //fillColor: 'rgb(0, 128, 128)',
        fillColor: layer.feature.properties.color,
        fillOpacity: '0.25'
      });
  };


  var onViewReset = function (event) {
    setCityMap($scope.precinctGeoJson);
  };

  // Setup the map add the precinct shapes and tile layer.
  var cityMap;
  var setMap = function (selector, precincts) {
    cityMap = cityMap || L.map(selector);

    cityMap.off('viewreset', onViewReset);
    cityMap.on('viewreset', onViewReset);

    if(!$scope.svg) {
      var precinctGroup = L.featureGroup();

      _.forEach(precincts, function (precinct) {
        var geo = L.geoJson(precinct, {
            onEachFeature: setPrectinct
          });
          precinctGroup.addLayer(geo);
      });

      var bounds = precinctGroup.getBounds();

      cityMap.setView(bounds.getCenter(), 11);

      var tiles = L.tileLayer('http://openmapsurfer.uni-hd.de/tiles/roadsg/x={x}&y={y}&z={z}', {
        attribution: 'Imagery from <a href="http://giscience.uni-hd.de/">GIScience Research Group @ University of Heidelberg</a> &mdash; Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>',
        minZoom: 11,
        maxZoom: 14
      });

      tiles.addTo(cityMap);

    }

    $scope.svg = $scope.svg || d3.select(cityMap.getPanes().overlayPane).append('svg');
    $scope.g = $scope.g || $scope.svg.append('g').attr('class', 'leaflet-zoom-hide');
  };


  var getPrecinctTotal = function (violation, year, precinctId) {
    var precinct = _.find($scope.precincts, { 'id': precinctId });
    if(!precinct) { return 0; }

    if(year === 'A') {
      var total = 0;
      _.forEach(_.keys(precinct.totals), function (yearKey) {
        total += getPrecinctTotal(violation, yearKey, precinct.id);
      });
      return total;
    }


    if(precinct.totals[year].hasOwnProperty(violation)) {
      return precinct.totals[year][violation].ytd_ttl;
    } else {
      return 0;
    }
  };


  var populatePrecinctInfo = function (precinctId) {
    var precinct = _.find($scope.precincts, { 'id': precinctId });
    var total = null;

    if($scope.violationFilter) {
      total = getPrecinctTotal($scope.violationFilter, $scope.yearFilter, precinct);
    }

    $scope.$apply(function () {
      $scope.precinctName = precinct.name;
      $scope.precinctTotal = total;
    });
  };


  var setCityMap = function(precinctData) {
    setMap('cityMap', precinctData.features);

    $scope.keySvg = $scope.keySvg || d3.select('.city-map').append('svg').attr('class', 'city-map-key');

    var color = d3.scale.threshold();

    // console.log(precinctData);

    var domainMax = d3.max(precinctData.features, function(d) {
      var precinctId = mapPrecinctId(d.properties.policePrecinct, 'pediacities');
      return getPrecinctTotal($scope.violationFilter, $scope.yearFilter, precinctId);
    });

    var domains = {
      superlo:  [0, 1, 2, 4, 6, 8, 10, 12, 14, 20],
      lo:       [0, 1, 2, 4, 10, 15, 30, 50, 100, 150],
      mid:      [0, 5, 10, 25, 50, 100, 150, 250, 500, 750, 1000],
      hi:       [0, 25, 100, 150, 250, 500, 750, 1000, 1250, 2500, 5000],
      hihi:     [0, 25, 100, 150, 250, 500, 750, 1000, 2500, 5000, 8000],
      minimega: [0, 500, 1000, 2000, 5000, 7500, 10000, 20000, 50000, 75000, 100000],
      mega:     [0, 1000, 2500, 5000, 7500, 10000, 15000, 25000, 50000, 75000, 100000]
    };

    // console.log(domainMax);
    var getDomain = function(domains, max) {

      if($scope.violationFilter === 'Speeding' && $scope.yearFilter === 'A') {
        return domains.hihi;
      }

      if (max < 50) {
        // console.log('superlo');
        return domains.superlo;
      }

      if (max < 150) {
        // console.log('lo');
        return domains.lo;
      }

      if (max < 1000) {
        // console.log('mid');
        return domains.mid;
      }

      if (max < 5000) {
        // console.log('hi');
        return domains.hi;
      }

      if (max < 10000) {
        // console.log('minimega');
        return domains.minimega;
      }

      // console.log('mega');
      return domains.mega;
    };

    color.domain(getDomain(domains, domainMax)).range(['transparent', '#fff5f0','#fee0d2','#fcbba1','#fc9272','#fb6a4a','#ef3b2c','#cb181d','#a50f15','#67000d']);

    // A position encoding for the key only.
    var x = d3.scale.linear()
      .domain(getDomain(domains, domainMax))
      .range([0,25]);

    var xAxis = d3.svg.axis()
      .scale(x)
      .orient('bottom')
      .tickSize(8)
      .tickValues(color.domain());

    var svg = $scope.svg;
    var g = $scope.g;
    $scope.keyGroup = $scope.keyGroup || $scope.keySvg.append('g').attr('id', 'mapKey').attr('transform', 'translate(45, 10)');

    // console.log(color.domain());
    var keyGroup = $scope.keyGroup.selectAll('rect')
      .data(color.range().map( function (d, i) {
        return {
          x0: i ? x(color.domain()[i - 1]) : x.range()[0],
          x1: i < color.domain().length ? x(color.domain()[i]) : x.range()[1],
          z: d
        };
      }));

    var keyGroupEnter = keyGroup.enter();

    keyGroupEnter.append('rect')
      .attr('height', 20)
      .attr('x', function(d) { return d.x0; })
      .attr('width', function(d) { return d.x1 - d.x0; })
      .style('fill', function(d) { return d.z; });

    $scope.keyGroup.selectAll('.x').remove();
    $scope.keyGroup.append('g')
      .attr('class', 'x axis')
      .call(xAxis).append('text')
      .attr('class', 'caption')
      .text('Number of summonses issued');

    var keyGroupUpdate = keyGroup.transition().attr('height', 8)
      .attr('x', function(d) { return d.x0; })
      .attr('width', function(d) { return d.x1 - d.x0; })
      .style('fill', function(d) { return d.z; })
      .call(xAxis);

    var projectPoint = function (x, y) {
      var point = cityMap.latLngToLayerPoint(new L.LatLng(y, x));
      this.stream.point(point.x, point.y);
    };

    var transform = d3.geo.transform({point: projectPoint});
    var path = d3.geo.path(precinctData).projection(transform);

    var precinct = g.selectAll('path')
      .data(precinctData.features);

    var precinctEnter = precinct.enter().append('path')
      .attr('d', d3.geo.path().projection(transform))
      .attr('class', 'precinct-shape')
      .attr('fill', function (d) {
        var precinctId = mapPrecinctId(d.properties.policePrecinct, 'pediacities');
        return color(getPrecinctTotal($scope.violationFilter, $scope.yearFilter, precinctId));
      });

    var bounds = path.bounds(precinctData),
      topLeft = bounds[0],
      bottomRight = bounds[1];

    svg.attr('width', bottomRight[0] - topLeft[0])
      .attr('height', bottomRight[1] - topLeft[1])
      .style('left', topLeft[0] + 'px')
      .style('top', topLeft[1] + 'px');

    g.attr('transform', 'translate(' + -topLeft[0] + ',' + -topLeft[1] + ')');

    precinctEnter.on('mouseover', function (d) {
      highlightPrecinct(d3.event.target);
      var precinctId = mapPrecinctId(d.properties.policePrecinct, 'pediacities');
      var precinct = _.find($scope.precincts, { 'id': precinctId });
      var precinctTotal = getPrecinctTotal($scope.violationFilter, $scope.yearFilter, precinctId);
      $scope.$apply(function () {
        $scope.precinctTotal = precinctTotal;
        $scope.precinctName = precinct.name;
      });
    });

    precinctEnter.on('mouseout', function (d) {
      removePrecinctHighlight(d3.event.target);
    });

    precinctEnter.on('click', function (d) {
      var precinctId = mapPrecinctId(d.properties.policePrecinct, 'pediacities');
      var precinct = _.find($scope.precincts, { 'id': precinctId });
      var violationTotal = getPrecinctTotal($scope.violationFilter, $scope.yearFilter, precinctId);
      precinct.geometry = d.geometry;
      $scope.$apply(function () {
        $scope.activePrecincts[0] = precinct;
        $scope.violationTotal = violationTotal;
      });
    });

    var precinctUpdate = precinct.transition()
      .attr('d', d3.geo.path().projection(transform))
      .attr('fill', function(d) {
        var precinctId = mapPrecinctId(d.properties.policePrecinct, 'pediacities');
        // console.log(color(getPrecinctTotal($scope.violationFilter, $scope.yearFilter, precinctId)));
        return color(getPrecinctTotal($scope.violationFilter, $scope.yearFilter, precinctId));
      });


    precinct.exit().remove();

  };

};

directives.cityMap.$inject = ['$scope', '$element', '$attrs', '$http'];
