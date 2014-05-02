'use strict';

angular.module('nycMovingViolationsApp')
.controller('NavbarCtrl', ['$scope', '$location', function ($scope, $location) {

  $scope.swapContent = function (item) {
    switch(item) {
      case 'Home':
        $scope.active = 'Home';
        $('.jumbotron .main-collapsed').show();
        $('.jumbotron .filters').show();
        $('.jumbotron .info-links').hide();
        break;
      case 'About':
        $scope.active = 'About';
        $('.jumbotron .main-collapsed').hide();
        $('.jumbotron .filters').hide();
        $('.jumbotron .info-links').removeClass('hide').show();
        $('.jumbotron').removeClass('collapsed').attr('style', '');
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
  $('.jumbotron .info-links').hide();

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
