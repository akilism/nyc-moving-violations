'use strict';

var path = require('path'),
    fs = require('fs'),
    q = require('q'),
    _ = require('lodash');

var readFile = q.denodeify(fs.readFile);
var writeFile = q.denodeify(fs.writeFile);
var dataPath = path.normalize(__dirname + '/../data');

//read all files extract precinct name and year end totals.
var getFiles = function () {
  var files = fs.readdirSync(dataPath);
  return files;
};

// build an object with the precinct data.
var buildPrecinct = function (fileContents) {
  var fileData = JSON.parse(fileContents);

  if(fileData.precinct) {
    //transit and housing arent tracked by precinct.
    if((fileData.precinct.indexOf('Transit') >= 0) || (fileData.precinct.indexOf('Housing') >= 0)) {
      console.log('Skipping: ' + fileData.precinct);
      return null;
    }
  } else { return null; }

  var precinct = {
    'id': fileData.precinct_id,
    'name': fileData.precinct,
    'totals': []
  };

  console.log(precinct.name, precinct.id);
  precinct.totals = getYearlyTotals(fileData['monthly_totals']);
  return precinct;
};

// build the yearly totals for a precinct.
var getYearlyTotals = function (fileData) {
  var years  = getYears(fileData);
  var totals = {};

  console.log(_.keys(years));

  _.forEach(_.keys(years), function (year) {
    totals[year] = getYearlyTotal(years[year]);
  });

  //console.log(totals);
  return totals;
};

// Build the total for the year by violation.
var getYearlyTotal = function (monthData) {
  // console.log(_.keys(monthData));
  var violations = {};

  _.forEach(monthData.violations, function(violation) {
    // initialize some variables.
    violations[violation.name] = violations[violation.name] || {};
    violations[violation.name].mtd_ttl = violations[violation.name].mtd_ttl || 0;
    violations[violation.name].ytd_ttl = violations[violation.name].ytd_ttl || 0;

    // total up the reported mtd and ytd.
    violations[violation.name].mtd_ttl += violation.mtd;
    violations[violation.name].ytd_ttl += violation.ytd;
  });

  return violations;
};

var getYears = function (fileData) {
  var years = _.indexBy(fileData, 'year');

  return years;
};

// save the data to a file.
var saveData = function (data) {
  var path = dataPath + '/precincts.json';
  writeFile(path, JSON.stringify(data, null, 4), 'utf-8').done(function () {
      console.log('Saved: ' + path);
  });
};


var getTotals = function () {
  var totals = [];
  var files = getFiles();
  var count = files.length;
  _.forEach(files, function(file) {
    var path = dataPath + '/' + file;

    readFile(path, 'utf-8').done(function (fileContents) {
      var precinctData = buildPrecinct(fileContents);
      if(precinctData) {
        totals.push(precinctData);
      }
      count--;
      if(count === 0) { saveData(totals); }
    });

  });

};


getTotals();





