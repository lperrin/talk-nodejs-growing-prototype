var Strings = require('./util/strings'),
    sql = require('./sql'),
    tweets = sql.table('tweets');

function Tweet(attributes) {
  this.id = attributes.id;
  this.text = attributes.text;
  this.userScreenName = attributes.user_screen_name;
  this.userName = attributes.user_name;
  this.nbComments = attributes.nb_comments || 0;
  this.createdAt = Strings.getTimestamp(attributes.created_at);
}

module.exports = Tweet;

// tip: always require after module.exports to mitigate circular dependencies
var Comment = require('./comment_res');

Tweet.list = function (done) {
  // select * from tweets order by created_at desc
  tweets.select('*', {}, {sortBy: ['-created_at']}, function (err, rows) {

    if (err)
      return done(err);

    var res = rows.map(function (row) {
      return new Tweet(row);
    });

    done(null, res);
  });
};

Tweet.fetch = function (id, done) {
  // select * from tweets where id = ?
  tweets.find(id, function (err, row) {
    if (err)
      return done(err);

    done(null, new Tweet(row));
  });
};

Tweet.parse = function (json) {
  return new Tweet({
    text: json.text,
    user_screen_name: json.user.screen_name,
    user_name: json.user.name,
    created_at: json.created_at
  });
};

Tweet.prototype.save = function (done) {
  var self = this;

  tweets.save(this.serialize(), function (err, id) {
    if (err)
      return done(err);

    self.id = id;
    done();
  });
};

Tweet.prototype.listComments = function (done) {
  Comment.listByTweet(this, done);
};

Tweet.prototype.postComment = function (comment, done) {
  var self = this;

  comment.tweetId = this.id;

  comment.save(function (err) {
    if (err)
      return done(err);

    self.nbComments++;
    self.save(done);
  });
};

Tweet.prototype.toJSON = function () {
  return {
    id: this.id,
    url: '/api/inbox/tweets/' + this.id,
    text: this.text,
    user: {screen_name: this.userScreenName, name: this.userName},
    nb_comments: this.nbComments,
    created_at: this.createdAt
  };
};

Tweet.prototype.serialize = function () {
  return {
    id: this.id,
    text: this.text,
    user_screen_name: this.userScreenName,
    user_name: this.userName,
    nb_comments: this.nbComments,
    created_at: new Date(this.createdAt)
  };
};