var http = require('http'),
    path = require('path'),
    express = require('express');

var app = express(),
    server = http.createServer(app),
    io = require('socket.io').listen(server);

// Express configuration
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, '..', 'views'));
app.set('view engine', 'jade');
app.use(express.json());
app.use(express.urlencoded());
app.use(app.router);
app.use(express.static(path.join(__dirname, '..', 'public')));
app.use(express.errorHandler());

// Socket.IO configuration
io.configure(function () {
  io.set('log level', 1);
});

// NEW: pass Socket.IO singleton to processors
require('./processors').init(io);

// NEW: mount routes separately
require('./routes').mount(app);

exports.start = function () {
  console.log('starting api, socket.io and processors');

  server.listen(app.get('port'), function() {
    console.log('Express server listening on port ' + app.get('port'));
  });
};