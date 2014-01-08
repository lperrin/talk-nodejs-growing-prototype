var events = require('events'),
    ee = new events.EventEmitter();

exports.push = function (name, data) {
  ee.emit(name, data, function (err) {
    if (err)
      console.error('error while processing', name, err);
  });
};

exports.process = function (name, cb) {
  ee.on(name, cb);
};