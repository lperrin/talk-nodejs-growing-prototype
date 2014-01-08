var http = require('http'),
    express = require('express');

var routes = require('../../routes');

var portrange = 45032;

function Server() {
  this.started = false;
  this.server = null;
}

module.exports = new Server();

Server.prototype.start = function (client, done) {
  var self = this,
      app = express();

  app.configure(function () {
    app.use(express.json());
    app.use(express.urlencoded());
    app.use(app.router);
  });

  routes.mount(app);
  this.started = true;

  findAvailablePort(app, function (server, port) {
    self.server = server;
    client.reset();
    client.setEndpoint('http://localhost:' + port);

    done();
  });
};

Server.prototype.reset = function () {
  if (!this.started)
    return;

  this.started = false;
  this.server.close();
  this.server = null;
};

function findAvailablePort(app, done) {
  var port = portrange;
  portrange += 1;

  var server = http.createServer(app);

  server.listen(port, function (err) {
    done(server, port);
  });

  server.on('error', function (err) {
    findAvailablePort(app, done);
  });
}