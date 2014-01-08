var _ = require('underscore'),
    config = require('../../../twont-conf.json'),
    driver = require('./' + config.sql);

exports.table = function (name) {
  return new Table(name);
};

exports.reset = driver.reset || function () {
  throw new Error('driver#reset() not implemented');
};

exports.dump = driver.dump || function (res) {
  res.write('driver#dump() not implemented');
};

exports.dumpTable = driver.dumpTable || function (table, res) {
  res.write('driver#dumpTable() not implemented');
};

exports.dumpTableId = driver.dumpTableId || function (table, id, res) {
  res.write('driver#dumpTable() not implemented');
};

exports.snapshot = driver.snapshot || function (blob) {
  throw new Error('driver#snapshot() not implemented');
};

exports.restore = driver.restore || function (blob) {
  throw new Error('driver#restore() not implemented');
};

function Table(name) {
  this.name = name;
}

Table.prototype.find = function (id, done) {
  this.findWhere('*', {id: id}, done);
};

Table.prototype.findWhere = function (fields, where, done) {
  var self = this;

  this.select(fields, where, {limit: 1}, function (err, results) {
    if (err)
      return done(err);

    if (results.length === 0)
      return done({status: 'not_found', reason: JSON.stringify(where), source: self.name + '_sql'});

    done(null, results[0]);
  });
};

Table.prototype.select = function (fields, where, options, done) {
  if (_.isFunction(options)) {
    done = options;
    options = {};
  }

  if (_.isString(fields))
    fields = [fields];

  var self = this;

  driver.getConnection(function (err, connection) {
    if (err)
      return done(err);

    connection.select(self.name, fields, where, options, function (err, rows) {
      connection.end();

      if (err)
        return done(err);

      if (fields.length === 1 && fields[0] !== '*')
        rows = _(rows).pluck(fields[0]);

      done(null, rows);
    });
  });
};

Table.prototype.save = function (blob, done) {
  var self = this;

  if (!blob.id)
    return this.insert(blob, done);

  this.update(blob, {id: blob.id}, function (err, n) {
    if (err)
      return done(err);

    if (n === 0)
      return done({status: 'not_found', reason: 'id ' + blob.id, source: self.name + '_sql'});

    done(null, blob.id);
  });
};

Table.prototype.insert = function (blob, done) {
  var self = this;

  driver.getConnection(function (err, connection) {
    if (err)
      return done(err);

    connection.insert(self.name, blob, function (err, id) {
      connection.end();
      done(err, id);
    });
  });
};

Table.prototype.update = function (changes, where, done) {
  var self = this;

  driver.getConnection(function (err, connection) {
    if (err)
      return done(err);

    connection.update(self.name, changes, where, function (err, n) {
      connection.end();
      done(err, n);
    });
  });
};

Table.prototype.delete = function (id, done) {
  var self = this;

  this.deleteWhere({id: id}, function (err, n) {
    if (err)
      return done(err);

    if (n === 0)
      return done({status: 'not_found', reason: 'id ' + id, source: self.name + '_sql'});

    done();
  });
};

Table.prototype.deleteWhere = function (where, done) {
  var self = this;

  driver.getConnection(function (err, connection) {
    if (err)
      return done(err);

    connection.deleteWhere(self.name, where, function (err, n) {
      connection.end();
      done(err, n);
    });
  });
};