'use strict';

var path = require('path'),
    fs = require('fs'),
    q = require('q'),
    _ = require('lodash');

var readFile = q.denodeify(fs.readFile);
var dataPath = path.normalize(__dirname + '/data');

exports.precincts = function(req, res) {
  //read precincts file off drive.
  var path = dataPath + '/precincts.json';
  readFile(path, 'utf-8').done(function (fileContents) {
    res.json(fileContents);
  });
};

exports.precinct = function(req, res) {
  //read the requested precinct file off drive.
  var path = dataPath + '/precincts.json';
  readFile(path, 'utf-8').done(function (fileContents) {
    res.json(fileContents);
  });
};
