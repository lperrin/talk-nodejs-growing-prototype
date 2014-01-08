var zlib = require('zlib'),
    fs = require('fs'),
    path = require('path'),
    _ = require('underscore'),
    paperwork = require('paperwork'),
    sql = require('../sql'),
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

  var snapfile = path.resolve(path.dirname(process.mainModule.filename), 'twont-snapshot.json.gz');

  app.get('/debug/snapshot', function (req, res) {
    var blob = {};

    sql.snapshot(blob);

    zlib.gzip(JSON.stringify(blob), function (err, archive) {
      if (err)
        return res.send(err.message);

      fs.writeFile(snapfile, archive, function (err) {
        if (err)
          return res.send(err.message);

        res.send(snapfile);
      });
    });
  });

  app.get('/debug/restore', function (req, res) {
    fs.readFile(snapfile, function (err, archive) {
      if (err)
        throw err;

      zlib.gunzip(archive, function (err, data) {
        if (err)
          throw err;

        var json = JSON.parse(data.toString('utf8'));

        sql.restore(json);

        res.send('snapshot restored');
      });
    });
  });
};