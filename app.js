var http = require('http'),
    path = require('path'),
    _ = require('underscore'),
    express = require('express');

var Twitter = require('twitter'),
    config = require('../twont-conf.json'),
    twitter = Twitter(config);

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

// A database stub
var tweetDb = {},
    commentDb = {};

// Some routes
app.get('/api/inbox/tweets', function (req, res) {
  var tweets = _(tweetDb).
    chain().
    values().
    sortBy('date').
    value();

  res.send({tweets: tweets});
});

app.all('/api/inbox/tweets/:tweet_id*', function (req, res, next) {
  var tweetId = parseInt(req.params.tweet_id, 10),
      tweet = tweetDb[tweetId];

  if (!tweet)
    return res.send(404, {reason: 'tweet not found'});

  req.tweet = tweet;
  next();
});

app.get('/api/inbox/tweets/:tweet_id', function (req, res) {
  res.send(req.tweet);
});

app.all('/api/inbox/tweets/:tweet_id/comments*', function (req, res, next) {
  var tweetId = req.tweet.id,
      tweetComments = commentDb[tweetId];

  if (!tweetComments) {
    tweetComments = [];
    commentDb[tweetId] = tweetComments;
  }

  req.comments = tweetComments;
  next();
});

app.get('/api/inbox/tweets/:tweet_id/comments', function (req, res) {
  res.send({comments: req.comments});
});

app.post('/api/inbox/tweets/:tweet_id/comments', function (req, res) {
  var newComment = req.body;
  req.comments.push(newComment);

  req.tweet.nb_comments++;

  io.sockets.emit('comment', newComment);
  io.sockets.emit('tweet', req.tweet);

  res.send(201, newComment);
});

app.get('/', function (req, res) {
  res.render('index', {});
});

server.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

twitter.stream('statuses/filter', {track: 'lemonde'}, function (stream) {
  stream.on('data', function (json) {
    var tweetId = _(tweetDb).size() + 1;

    var tweet = {
      id: tweetId,
      url: '/api/inbox/tweets/' + tweetId,
      text: json.text,
      user: {screen_name: json.user.screen_name, name: json.user.name},
      created_at: new Date(json.created_at).getTime(),
      nb_comments: 0
    };

    console.log('@' + tweet.user.screen_name + ': ' + tweet.text);

    tweetDb[tweet.id] = tweet;
    io.sockets.emit('tweet', tweet);
  });
});