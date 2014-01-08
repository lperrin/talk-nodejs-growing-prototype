var _ = require('underscore'),
    paperwork = require('paperwork'),
    Tweet = require('../tweet_res'),
    Comment = require('../comment_res');

exports.mount = function (app) {
  app.all('/api*', require('../util/http_error'));

  app.get('/api/inbox/tweets', function (req, res) {
    // NEW: delegate deserialization to resource
    Tweet.list(function (err, tweets) {
      if (err)
        return res.locals.sendError(err);

      res.send({tweets: _(tweets).invoke('toJSON')});
    });
  });

  app.all('/api/inbox/tweets/:tweet_id*', function (req, res, next) {
    var tweetId = parseInt(req.params.tweet_id, 10);

    // NEW: stub database replaced by real SQL queries
    Tweet.fetch(tweetId, function (err, tweet) {
      if (err)
        return res.locals.sendError(err);

      req.tweet = tweet;
      next();
    });
  });

  app.get('/api/inbox/tweets/:tweet_id', function (req, res) {
    res.send(req.tweet.toJSON());
  });

  app.all('/api/inbox/tweets/:tweet_id/comments*', function (req, res, next) {
    var tweetId = req.tweet.id;

    req.tweet.listComments(function (err, comments) {
      if (err)
        return res.locals.sendError(err);

      req.comments = comments;
      next();
    });
  });

  app.get('/api/inbox/tweets/:tweet_id/comments', function (req, res) {
    res.send({comments: _(req.comments).invoke('toJSON')});
  });

  app.post('/api/inbox/tweets/:tweet_id/comments', paperwork({
    uid: /[a-z0-9]+/,
    body: String,
    author: {
      name: String
    },
    date: Number
  }), function (req, res) {
    var json = req.body;

    var newComment = new Comment({
      uid: json.uid,
      body: json.body,
      author_name: json.author.name,
      date: Date.now()
    });

    req.tweet.postComment(newComment, function (err) {
      if (err)
        return res.locals.sendError(err);

      res.send(201, newComment.toJSON());
    });
  });

  app.get('/', function (req, res) {
    res.render('index', {});
  });

};