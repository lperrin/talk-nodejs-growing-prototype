var http = require('http'),
    path = require('path'),
    _ = require('underscore'),
    async = require('async'),
    paperwork = require('paperwork'),
    express = require('express');

var Twitter = require('twitter'),
    config = require('../twont-conf.json'),
    twitter = Twitter(config.twitter);

// NEW: sql configuration + table wrappers
var Tweet = require('./tweet_res'),
    Comment = require('./comment_res');

var app = express(),
    server = http.createServer(app),
    io = require('socket.io').listen(server);

// Express configuration
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.json());
app.use(express.urlencoded());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.errorHandler());

// Socket.IO configuration
io.configure(function () {
  io.set('log level', 1);
});

// Some routes

// NEW: an Express helper to add res.locals.sendError
app.all('/api*', require('./util/http_error'));

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

// NEW: paperwork template to validate POST
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

    io.sockets.emit('comment', newComment.toJSON());
    io.sockets.emit('tweet', req.tweet.toJSON());

    res.send(201, newComment.toJSON());
  });
});

app.get('/', function (req, res) {
  res.render('index', {});
});

app.get('/sql', function (req, res) {
  require('./sql').dump(res);
});

server.listen(app.get('port'), function() {
  console.log('Express server listening on port ' + app.get('port'));
});

twitter.stream('statuses/filter', {track: 'lemonde'}, function (stream) {
  stream.on('data', function (json) {
    var tweet = Tweet.parse(json);

    console.log('@' + tweet.userScreenName + ': ' + tweet.text);

    tweet.save(function (err) {
      if (err)
        console.error('could not save tweet', err);
      else
        io.sockets.emit('tweet', tweet.toJSON());
    });
  });
});