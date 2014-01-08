var util = require('util'),
    events = require('events');

function MockTwitter() {
  events.EventEmitter.call(this);
}

util.inherits(MockTwitter, events.EventEmitter);

MockTwitter.prototype.stream = function (command, options, cb) {
  var self = this;

  process.nextTick(function () {
    cb(self);
  });
};

MockTwitter.prototype.simulateIncoming = function () {
  this.emit('data', {
    text: 'this is a random tweet',
    user: {
      screen_name: 'randomuser',
      name: 'Random User'
    },
    created_at: new Date().toString()
  });
};

var instances = [];

module.exports = function () {
  var twitter = new MockTwitter();
  instances.push(twitter);

  return twitter;
};

module.exports.instances = instances;