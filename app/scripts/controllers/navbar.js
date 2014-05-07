'use strict';

angular.module('nycMovingViolationsApp')
.controller('NavbarCtrl', ['$scope', '$location', function ($scope, $location) {

  $scope.swapContent = function (item) {
    switch(item) {
      case 'Home':
        $scope.active = 'Home';
        $('.jumbotron').addClass('vanish');
        $('.map-wrapper').show();
        break;
      case 'About':
        $scope.active = 'About';
        $('.jumbotron').removeClass('vanish');
        $('.map-wrapper').hide();
        break;
    }
  };

  $scope.menu = [{
    'title': 'Home'
  },
  {
    'title': 'About'
  }];

  $scope.active = 'Home';
  //$('.jumbotron').hide();

  $scope.isActive = function(title) {
    return title === $scope.active;
  };

  var closePrecincts = function () {
    $('.precinct-drawer').hide();
    $('#precinctClose').off('click');
    $('#btnPrecincts').on('click', openPrecincts);
  };

  var openPrecincts = function () {
    $('.precinct-drawer').show();
    $('#precinctClose').on('click', closePrecincts);
    $('#btnPrecincts').off('click');
  };

  $(document).ready(function () {
    $('.precinct-drawer').hide();
    $('#btnPrecincts').on('click', openPrecincts);
  });

}]);
