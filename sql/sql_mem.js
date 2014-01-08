var _ = require('underscore');

var tables = {},
    indexes = {};

exports.getConnection = function (done) {
  done(null, new SQLMemConnection());
};

var create = exports.create = function (name, uniqueIndexes) {
  var table = new SQLMemTable(name);
  tables[name] = table;

  _(uniqueIndexes || []).each(function (unique) {
    table.addIndex(unique);
  });

  return table;
};

exports.reset = function () {
  _(tables).each(function (table) {
    table.reset();
  });
};

exports.dump = function (stream) {
  (stream || process.stdout).write(JSON.stringify(_(tables).map(function (table) {
    var obj = {};
    obj[table.name] = table.data;

    return obj;
  }), null, '  '));
};

exports.dumpTable = function (tableName, stream) {
  var table = tables[tableName];
  (stream || process.stdout).write(JSON.stringify(table ? table.data : {status: 'not_found'}, null, '  '));
};

exports.dumpTableId = function (tableName, id, stream) {
  stream = stream || process.stdout;

  var table = tables[tableName];

  if (!table)
    stream.write(JSON.stringify({status: not_found}, null, '  '));
  else
    stream.write(JSON.stringify(table.data[id], null, '  '));
};

exports.snapshot = function (blob) {
  _(tables).each(function (table, name) {
    blob[name] = _(table.data).clone();
    blob[name + '_incr'] = table.autoIncrement;
  });
};

exports.restore = function (blob) {
  _(tables).each(function (table, name) {
    table.data = blob[name] || {};
    table.autoIncrement = blob[name + '_incr'] || 1;
  });
};

function SQLMemConnection() {
  this.ended = false;
}

SQLMemConnection.prototype.select = function (tableName, fields, where, options, done) {
  var table = tables[tableName];

  done = defer(done);

  table.select(fields, where, options, done);
};

SQLMemConnection.prototype.insert = function (tableName, blob, done) {
  var table = tables[tableName];

  if (!table)
    throw new Error(tableName + ' not declared');

  done = defer(done);

  table.insert(blob, done);
};

SQLMemConnection.prototype.update = function (tableName, changes, where, done) {
  var table = tables[tableName];

  done = defer(done);

  table.update(changes, where, done);
};

SQLMemConnection.prototype.deleteWhere = function (tableName, where, done) {
  var table = tables[tableName];

  done = defer(done);

  table.deleteWhere(where, done);
};

SQLMemConnection.prototype.end = function () {
  this.ended = true;
};

function SQLMemTable(name) {
  this.name = name;
  this.data = {};
  this.indexes = [];
  this.autoIncrement = 1;
}

SQLMemTable.prototype.addIndex = function (uniqueIndex) {
  this.indexes.push(uniqueIndex);
};

SQLMemTable.prototype.select = function (fields, where, options, done) {
  var noConditions = _(where).size() === 0,
      rows = null;

  if (noConditions)
    rows = _(this.data).values();
  else {
    // this used to be simply: rows = _(this.data).where(where);
    // however, you now have the option of passing custom conditions
    rows = _(this.data).filter(function (row) {
      return _(where).all(function (condition, name) {
        return testCondition(condition, row[name]);
      });
    });
  }

  // clone to avoid messing with the original data
  rows = _(rows || []).map(function (row) {
    return _(row).clone();
  });

  if (options.sortBy)
    rows = rows.sort(comparator(options.sortBy));

  if (options.offset)
    rows = rows.slice(options.offset);

  if (options.limit)
    rows = _(rows).first(options.limit);

  // select only requested fields
  if (fields.length > 1 || fields[0] !== '*') {
    rows = _(rows).map(function (row) {
      return _(row).pick(fields);
    });
  }

  done(null, rows);
};

SQLMemTable.prototype.insert = function (blob, done) {
  var self = this;

  var conflicting = this._findConflict(blob);

  // MySQL would not return the conflicting ID, but it helps for debugging
  if (conflicting) {
    done({
      status: 'conflict',
      reason: 'new',
      source: self.name + '_sql',
      conflicting: conflicting.id
    });

    return;
  }

  var id = this.autoIncrement,
      clone = _(blob).clone();

  this.autoIncrement++;

  clone.id = id;
  this.data[id] = clone;

  done(null, id);
};

SQLMemTable.prototype.update = function (changes, where, done) {
  var self = this,
      n = 0;

  var hasConflict = _.chain(this.data).where(where).any(function (blob) {
    var changed = _.extend({}, blob, changes),
        conflicting = self._findConflict(changed);

    if (conflicting) {
      done({
        status: 'conflict',
        reason: 'id ' + conflicting.id,
        source: self.name + '_sql',
        conflicting: conflicting.id
      });

      return true;
    }

    return false;
  }).value();

  if (hasConflict)
    return;

  _.chain(this.data)
    .where(where)
    .tap(function (matches) {
      n = matches.length;
    })
    .each(function (blob) {
      _(blob).extend(changes);
    });

  done(null, n);
};

SQLMemTable.prototype.deleteWhere = function (where, done) {
  var self = this,
      n = 0;

  _.chain(this.data)
    .where(where)
    .pluck('id')
    .tap(function (ids) {
      n = ids.length;
    })
    .each(function (id) {
      delete self.data[id];
    });

  done(null, n);
};

SQLMemTable.prototype._findConflict = function (blob) {
  var self = this,
      conflicting = null;

  var hasConflict = _(this.indexes).any(function (uniqueIndex) {
    var condition = _(blob).pick(uniqueIndex),
        existing = _(self.data).findWhere(condition);

    if (existing && (blob.id !== existing.id)) {
      conflicting = existing;

      return true;
    }

    return false;
  });

  return hasConflict ? conflicting : null;
};

SQLMemTable.prototype.reset = function () {
  this.data = {};
  this.autoIncrement = 1;
};

function defer(done) {
  // we need to change data immediately to prevent race conditions
  // we defer in the callback
  return function () {
    var args = Array.prototype.slice.call(arguments);

    process.nextTick(function () {
      done.apply(null, args);
    });
  };
}

function comparator(props) {
  var sort = _(props).map(function (prop) {
    var res = (/^([\-\+])?(.*)$/).exec(prop);

    var sign = res[1] !== '-' ? 1 : -1,
        column = res[2];

    return [sign, column];
  });

  return function (a, b) {
    for(var i = 0, l = sort.length; i < l; i++) {
      var sign = sort[i][0],
          col = sort[i][1],
          va = a[col],
          vb = b[col];

      if (va === vb)
        continue;

      return sign * (va < vb ? -1 : 1);
    }

    return 0;
  };
}

function testCondition(condition, value) {
  if (!_.isArray(condition))
    return condition === value;

  var op = condition[0];

  var expected = condition[1];

  switch (op) {
    case 'in':
      // when passed an array, interpret as an "IN" statement
      // http://dev.mysql.com/doc/refman/5.0/en/comparison-operators.html#function_in
      return _(expected).contains(value);

    case 'neql':
      return expected !== value;

    default:
      throw new Error('operator not implemented: ' + op);
  }
}

create('tweets');
create('comments', [['uid']]);