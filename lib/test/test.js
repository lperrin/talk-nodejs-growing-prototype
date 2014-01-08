var should = require('should'),
    http = require('http'),
    express = require('express'),
    transquire = require('../util/transquire');

var sio = transquire('socket.io', './mocks/socket.io'),
    twitter = transquire('twitter', './mocks/twitter'),
    config = transquire('../../../twont-conf.json', './mocks/test-conf.json');

var server = require('./common/server'),
    client = require('./common/client'),
    sql = require('../sql'),
    processors = require('../processors'),
    TwitterStream = require('../twitter_stream');

describe('Twont', function () {
  var io = sio.get(),
      twitterClient = null;

  before(function (done) {
    sql.reset();
    sio.reset();
    io = sio.get();

    processors.init(io);
    TwitterStream.start();

    twitter.instances.should.have.lengthOf(1);
    twitterClient = twitter.instances[0];

    server.reset();
    server.start(client, done);
  });

  it('should tell socket.io clients about incoming tweets', function (done) {
    var user1 = io.incoming(),
        user2 = io.incoming(),
        user3 = io.incoming();

    var numNotificationsReceived = 0;

    function receivedUpdate(data) {
      should.exist(data);
      data.should.have.property('text', 'this is a random tweet');
      numNotificationsReceived++;

      if (numNotificationsReceived >= 3) {
        user1.removeListener('tweet', receivedUpdate);
        user2.removeListener('tweet', receivedUpdate);
        user3.removeListener('tweet', receivedUpdate);

        done();
      }
    }

    user1.on('tweet', receivedUpdate);
    user2.on('tweet', receivedUpdate);
    user3.on('tweet', receivedUpdate);

    twitterClient.simulateIncoming();
  });

  it('should list all tweets', function (done) {
    client.get('/api/inbox/tweets', 200, function (body) {
      should.exist(body);
      body.should.have.property('tweets').with.lengthOf(1);

      var firstTweet = body.tweets[0];
      firstTweet.should.have.property('text', 'this is a random tweet');
      firstTweet.should.have.property('url', '/api/inbox/tweets/1');

      done();
    });
  });

  it('should fetch a single tweet', function (done) {
    client.get('/api/inbox/tweets/1', 200, function (body) {
      should.exist(body);
      body.should.have.property('text', 'this is a random tweet');
      done();
    });
  });

  it('should post a comment', function (done) {
    client.post('/api/inbox/tweets/1/comments', {
      uid: '12345',
      body: 'this is a comment',
      author: {name: 'Someone'},
      date: Date.now()
    }, 201, function (body) {
      done();
    });
  });

  it('should list all comments', function (done) {
    client.get('/api/inbox/tweets/1/comments', 200, function (body) {
      should.exist(body);
      body.should.have.property('comments').with.lengthOf(1);

      var firstComment = body.comments[0];

      firstComment.should.have.property('body', 'this is a comment');
      done();
    });
  });
});