'use strict';

// Module dependencies.
var express = require('express');

var app = express();


// Express Configuration
require('./lib/config/express')(app);

// Controllers
var api = require('./lib/controllers/api'),
    index = require('./lib/controllers');

// Server Routes
app.get('/api/precincts', api.precincts);
app.get('/api/precinct/:id', api.precinct);
app.get('/api/precinct-geo', api.precinctGeo);

// Angular Routes
app.get('/views/partials/*', index.partials);
app.get('/partials/*', index.partials);
app.get('/', index.index);

// Start server
var port = process.env.PORT || 3000;
app.listen(port, function () {
  console.log('Express server listening on port %d in %s mode', port, app.get('env'));
});

// Expose app
exports = module.exports = app;
