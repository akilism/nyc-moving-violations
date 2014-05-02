'use strict';

directives.directive('mvPrecinctModal', function () {
  return {
    templateUrl: 'partials/precinct_modal.html',
    restrict: 'E',
    controller: directives.precinctModal,
    controllerAs: 'precinctModal',
    link: function postLink(scope, element, attrs) {

      var miniMapId = 'miniMap_' + scope.precinct.id;
      element.find('.precinct-mini-map').attr('id', miniMapId);

      var setPrectinct = function (feature, layer) {
        layer.setStyle({
          color: 'rgb(0, 0, 0)',
          weight: 1,
          fillColor: 'rgb(0, 128, 128)',
          fillOpacity: '0.25'
        });
      };

      var setMiniMap = function (precinctGeoJson, mapElement) {
        //setup a leafletmap.
        // console.log(mapElement);
        var precinctMap = L.map(mapElement, {
          dragging: false
          // zoomControl: false
        });

        // var precinct = L.featureGroup();

        var precinctGeo = L.geoJson(precinctGeoJson, {
          onEachFeature: setPrectinct
        });

        // precinctGroup.addLayer(geo);

        var bounds = precinctGeo.getBounds();

        precinctGeo.addTo(precinctMap);
        precinctMap.setView(bounds.getCenter(), 11);

        // var tiles = L.tileLayer('http://{s}.{base}.maps.cit.api.here.com/maptile/2.1/maptile/{mapID}/pedestrian.day/{z}/{x}/{y}/256/png8?app_id={app_id}&app_code={app_code}', {
        //   attribution: 'Map &copy; 1987-2014 <a href="http://developer.here.com">HERE</a>',
        //   subdomains: '1234',
        //   mapID: 'newest',
        //   app_id: 'TalFdVVqSwdoOWYLFZzk',
        //   app_code: 'dWMkYcqlYDi2p3YFmez3pA',
        //   base: 'base',
        //   minZoom: 11,
        //   maxZoom: 13
        // });

var tiles = L.tileLayer('http://openmapsurfer.uni-hd.de/tiles/roadsg/x={x}&y={y}&z={z}', {
  attribution: '<a href="http://giscience.uni-hd.de/">GIScience</a> | <a href="http://openstreetmap.org">OpenStreetMap</a>',
  minZoom: 11,
  maxZoom: 12
});

tiles.addTo(precinctMap);
};

      // var el = element.find('.precinct-mini-map');
      setMiniMap(scope.precinct.geometry, miniMapId);

      $('.precinct-modal').draggable();
      $('.btn-close').on('click', function () {
        $('.btn-close').off('click');
        $('.precinct-modal').css('display', 'none');
      });
    }
  };
});

directives.precinctModal = function ($scope, $element, $attrs, $http) {


  // $scope.$watch('violationFilter', function(newValue, oldValue) {
  //   if(newValue && $scope.yearFilter) {
  //     // console.log('precinctModal:watch', $scope.precinct.id, $scope.yearFilter, $scope.violationFilter);
  //   }
  // });

  // $scope.$watch('yearFilter', function(newValue, oldValue) {
  //   if(newValue && $scope.violationFilter) {
  //     // console.log('precinctModal:watch', $scope.precinct.id, $scope.yearFilter, $scope.violationFilter);
  //   }
  // });

  // var setLineGraph = function (precinct, yearFilter, violationFilter) {
  //   // console.log(precinct, yearFilter, violationFilter);
  //   // $http({method: 'GET', url: '/api/precinct/' + precinct + '?year=' + yearFilter + '&violation=' + violationFilter }).
  //   // success(function(data, status, headers, config) {
  //   //   _.forEach(data.monthly_totals, function(month) {
  //   //     month.date = new Date(month.year, month.month_no);
  //   //   });

  //   //   $scope.graphData = data;
  //   //   console.log($scope.graphData);
  //   //   // setCityMap($scope.precinctGeoJson);
  //   //   // setMap('cityMap', data.features);
  //   // }).
  //   // error(function(data, status, headers, config) {
  //   // });

  // };
};

directives.precinctModal.$inject = ['$scope', '$element', '$attrs', '$http'];
