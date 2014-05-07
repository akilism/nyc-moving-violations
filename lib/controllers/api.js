'use strict';

var path = require('path'),
    fs = require('fs'),
    q = require('q'),
    _ = require('lodash');

var readFile = q.denodeify(fs.readFile);
var dataPath = path.normalize(__dirname + '/../data');


var sendFile = function (path, res) {
  readFile(path, 'utf-8').done(function (fileContents) {
    res.send(JSON.parse(fileContents));
  });
};

var sendFilteredFile = function (path, violation, year, res) {
  readFile(path, 'utf-8').done(function (fileContents) {
      var filteredData = filterFile(violation, year, JSON.parse(fileContents));
      res.send(filteredData);
  });
};

var filterFile = function (violation, year, precinctData) {
  //find monthly totals where year === year.
  //find violations where name === violation.
  //add to new object.
  //{"precinct_id": "104", "precinct": "104th Precinct", "monthly_totals": []}

  var filteredData = {
    'precinct_id': precinctData.precinct_id,
    'precinct': precinctData.precinct,
    'monthly_totals': []
  };

  console.log('monthly_totals.length : ' + precinctData.monthly_totals.length);
  //if no year pass or 'A' for all years then use all years otherwise filter by year.
  var filteredYears = (!year || (year === 'A')) ? precinctData.monthly_totals : _.filter(precinctData.monthly_totals, function (month) {
    return month.year === year;
  });

  //if a violation was passed then filter by the violation.
  if(violation) {
    _.forEach(filteredYears, function (month) {
      //filteredYears[i].violations[i].name === violation
      month.violations = [_.find(month.violations, function (month_violation) {
        return month_violation.name === violation;
      })];
    });
  }

  filteredData.monthly_totals = filteredYears;

  return filteredData;
};

exports.precincts = function(req, res) {
  //read precincts file off drive.
  var path = dataPath + '/precincts.json';
  sendFile(path, res);
};

exports.precinct = function(req, res) {
  var precinctId = req.params.id;
  var violation = req.query.violation;
  var year = (req.query.year && req.query.year !== 'A') ? parseInt(req.query.year, 10) : req.query.year;
  var path = dataPath + '/' + precinctId + '_precinct.json';
  console.log(precinctId, violation, year, path);

  // send the filtered results if they are being requested
  if (violation || year) {
    return sendFilteredFile(path, violation, year, res);
  }

  //read the requested precinct file off drive.
  sendFile(path, res);
};

exports.precinctGeo = function(req, res) {
  //read the requested precinct file off drive.
  var path = dataPath + '/police-precincts.geojson';
  sendFile(path, res);
};

