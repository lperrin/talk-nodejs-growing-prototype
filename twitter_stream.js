var Tweet = require('./tweet_res');

var Twitter = require('twitter'),
    config = require('../twont-conf.json'),
    twitter = Twitter(config.twitter);

exports.start = function () {
  twitter.stream('statuses/filter', {track: config.twitter.hashtag}, function (stream) {
    stream.on('data', function (json) {
      var tweet = Tweet.parse(json);

      tweet.save(function (err) {
        if (err)
          console.error('could not save tweet', err);
      });
    });

    stream.on('error', function (err) {
      console.error(err);
    });
  });
};