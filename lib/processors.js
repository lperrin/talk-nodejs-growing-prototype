var mq = require('./mq'),
    Tweet = require('./tweet_res'),
    Comment = require('./comment_res');

exports.init = function (io) {
  mq.process('tweet_update', function (tweetId, done) {
    Tweet.fetch(tweetId, function (err, tweet) {
      if (!err)
        io.sockets.emit('tweet', tweet.toJSON());


      done(err);
    });
  });

  mq.process('new_comment', function (commentId, done) {
    Comment.fetch(commentId, function (err, comment) {
      if (!err)
        io.sockets.emit('comment', comment.toJSON());

      done(err);
    });
  });
};