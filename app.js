var http = require('http'),
    path = require('path'),
    _ = require('underscore'),
    express = require('express');

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
var messageDb = {
  1: {
    id: 1,
    url: '/api/inbox/messages/1',
    from: {name: 'Laurent Perrin'},
    subject: 'How are you doing today?',
    date: Date.now()
  },
  2: {
    id: 2,
    url: '/api/inbox/messages/2',
    from: {name: 'Some User'},
    subject: 'Need info!',
    date: Date.now() - 60000
  }
};

var commentDb = {
  1: [{
    author: {name: 'Laurent Perrin'},
    body: 'This is a comment',
    date: Date.now() - 30000
  }, {
    author: {name: 'Someone else'},
    body: 'This is another comment',
    date: Date.now()
  }]
};

// Some routes
app.get('/api/inbox/messages', function (req, res) {
  var messages = _(messageDb).
    chain().
    values().
    sortBy('date').
    value();

  res.send({messages: messages});
});

app.all('/api/inbox/messages/:message_id*', function (req, res, next) {
  var messageId = parseInt(req.params.message_id, 10),
      message = messageDb[messageId];

  if (!message)
    return res.send(404, {reason: 'message not found'});

  req.message = message;
  next();
});

app.get('/api/inbox/messages/:message_id', function (req, res) {
  res.send(req.message);
});

app.all('/api/inbox/messages/:message_id/comments*', function (req, res, next) {
  var messageId = req.message.id,
      messageComments = commentDb[messageId];

  if (!messageComments) {
    messageComments = [];
    commentDb[messageId] = messageComments;
  }

  req.comments = messageComments;
  next();
});

app.get('/api/inbox/messages/:message_id/comments', function (req, res) {
  res.send({comments: req.comments});
});

app.post('/api/inbox/messages/:message_id/comments', function (req, res) {
  var newComment = req.body;
  req.comments.push(newComment);

  io.sockets.emit('comment', newComment);

  res.send(201, newComment);
});

app.get('/', function (req, res) {
  res.render('index', {});
});

server.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
