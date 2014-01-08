var _ = require('underscore'),
    config = require('../../../twont-conf.json'),
    mysql = require('mysql'),
    pool = mysql.createPool(config.mysql);

var noop = function () {};

exports.getConnection = function (done) {
  pool.getConnection(function (err, connection) {
    if (err)
      return done({status: 'internal_error', reason: err.message, source: 'mysql'});

    done(null, new SQLConnection(connection));
  });
};

function SQLConnection(connection) {
  this.connection = connection;
}

SQLConnection.prototype.select = function (tableName, fields, where, options, done) {
  var query = 'select ' + fields.join(', ') + ' from ' + tableName,
      hasConditions = _(where).size() > 0;

  if (hasConditions)
    query += ' where ' + _(where).map(makeSQLCondition).join(' and ');

  if (options.sortBy) {
    query += ' order by ' + _(options.sortBy).map(function (prop) {
      var res = (/^([\-\+])?(.*)$/).exec(prop);

      var sign = res[1] !== '-' ? 'asc' : 'desc',
          column = res[2];

      return column + ' ' + sign;
    }).join(', ');
  }

  if (options.limit)
    query += ' limit ' + options.limit;

  if (options.offset)
    query += ' offset ' + options.offset;

  this.connection.query(query, where, function (err, rows) {
    if (err)
      return reportSQLError(err, tableName, done);

    done(null, rows);
  });
};

SQLConnection.prototype.insert = function (tableName, blob, done) {
  this.connection.query('insert into ' + tableName + ' set ?', blob, function (err, results) {
    if (err)
      return reportSQLError(err, tableName, done);

    done(null, results.insertId);
  });
};

SQLConnection.prototype.update = function (tableName, changes, where, done) {
  var query = 'update ' + tableName + ' set ? where ' + _(where).map(function (value, key) {
    return mysql.escapeId(key) + ' = ' + mysql.escape(value);
  }).join(' and ');

  this.connection.query(query, changes, function (err, results) {
    if (err)
      return reportSQLError(err, tableName, done);

    done(null, results.affectedRows);
  });
};

SQLConnection.prototype.deleteWhere = function (tableName, where, done) {
  var query = 'delete from ' + tableName + ' where ' + _(where).map(function (value, key) {
    return mysql.escapeId(key) + ' = ' + mysql.escape(value);
  }).join(' and ');

  this.connection.query(query, function (err, results) {
    if (err)
      return reportSQLError(err, tableName, done);

    done(null, results.affectedRows);
  });
};

SQLConnection.prototype.end = function () {
  // if a fatal error occurs, the connection will release itself.
  // test if the pool is still here to avoid releasing twice.
  if (this.connection && this.connection._pool) {
    this.connection.release(noop);
    this.connection = null;
  }
};

function reportSQLError(err, tableName, done) {
  done({
    status: err.code === 'ER_DUP_ENTRY' ? 'conflict' : 'internal_error',
    reason: err.message,
    source: tableName + '_sql'
  });
}

function makeSQLCondition(condition, key) {
  var safeKey = mysql.escapeId(key);

  // normal case A = B
  if (!_.isArray(condition))
    return safeKey + ' = ' + mysql.escape(condition);

  var op = condition[0];

  var expected = condition[1];

  switch (op) {
    case 'in':
      // when passed an array, interpret as an "IN" statement
      // http://dev.mysql.com/doc/refman/5.0/en/comparison-operators.html#function_in
      return safeKey + ' in (' + _(expected).map(function (element) {
        return mysql.escape(element);
      }).join(', ') + ')';

    case 'neql':
      return '(' + safeKey + 'is null or ' +  safeKey + ' != ' + mysql.escape(expected) + ')';

    default:
      throw new Error('operator not implemented: ' + op);
  }
}