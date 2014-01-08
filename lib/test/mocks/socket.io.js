var util = require('util'),
    EventEmitter = require('events').EventEmitter,
    _ = require('underscore');

var socketId = null,
    instance = null;

exports.reset = function () {
  socketId = 0;

  if (instance)
    instance.removeAllListeners();

  instance = new SocketIO();
};

exports.get = function () {
  return instance;
};

exports.listen = function (server) {
  return instance;
};

function SocketIO() {
  EventEmitter.call(this);

  this._sockets = [];
  this.rooms = {};
}

util.inherits(SocketIO, EventEmitter);

SocketIO.prototype.configure = function () {};

SocketIO.prototype.__defineGetter__('sockets', function () {
  return this;
});

SocketIO.prototype.incoming = function () {
  var self = this,
      socket = new Socket(this);

  this.emit('connection', socket);
  this._sockets.push(socket);

  socket.once('disconnect', function () {
    self._sockets = _(self._sockets).without(socket);
  });

  return socket;
};

SocketIO.prototype.emit = function (name, data) {
  _(this._sockets).each(function (socket) {
    socket.emit(name, data);
  });
};

SocketIO.prototype.join = function (socket, room) {
  this.rooms[room] = (this.rooms[room] || []).concat(socket);
};

SocketIO.prototype.leave = function (socket, room) {
  this.rooms[room] = _(this.rooms[room]).without(socket);
};

SocketIO.prototype.clients = function (room) {
  return this.rooms[room] || [];
};

SocketIO.prototype.in = function (room) {
  var self = this;

  return {
    emit: function () {
      var args = Array.prototype.slice.call(arguments);

      _(self.rooms[room]).each(function (socket) {
        socket.emit.apply(socket, args);
      });
    }
  };
};

function Socket(pool) {
  EventEmitter.call(this);

  this.id = ++socketId;
  this.pool = pool;
}

util.inherits(Socket, EventEmitter);

Socket.prototype.join = function (room) {
  this.pool.join(this, room);
};

Socket.prototype.leave = function (room) {
  this.pool.leave(this, room);
};

Socket.prototype.disconnect = function () {
  this.emit('disconnect');
};

Socket.prototype.emit = function (name) {
  EventEmitter.prototype.emit.apply(this, arguments);
};