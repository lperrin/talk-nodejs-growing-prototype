var Strings = require('./util/strings'),
    sql = require('./sql'),
    comments = sql.table('comments'),
    mq = require('./mq');

function Comment(attributes) {
  this.id = attributes.id;
  this.uid = attributes.uid;
  this.body = attributes.body;
  this.authorName = attributes.author_name;
  this.tweetId = attributes.tweet_id;
  this.date = Strings.getTimestamp(attributes.date);
}

module.exports = Comment;

Comment.fetch = function (id, done) {
  comments.find(id, function (err, row) {
    if (err)
      return done(err);

    done(null, new Comment(row));
  });
};

Comment.listByTweet = function (tweet, done) {
 // select * from tweets order by created_at desc
 comments.select('*', {tweet_id: tweet.id}, {sortBy: ['date']}, function (err, rows) {
   if (err)
     return done(err);

   var res = rows.map(function (row) {
     return new Comment(row);
   });

   done(null, res);
 });
};

Comment.prototype.save = function (done) {
  var self = this;

  comments.save(this.serialize(), function (err, id) {
    if (err)
      return done(err);

    self.id = id;
    mq.push('new_comment', self.id);

    done();
  });
};

Comment.prototype.toJSON = function () {
  return {
    id: this.id,
    uid: this.uid,
    body: this.body,
    author: {name: this.authorName},
    date: this.date
  };
};

Comment.prototype.serialize = function () {
  return {
    id: this.id,
    uid: this.uid,
    body: this.body,
    tweet_id: this.tweetId,
    author_name: this.authorName,
    date: new Date(this.date)
  };
};