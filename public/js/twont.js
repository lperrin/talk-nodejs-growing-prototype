var app = angular.module('app', []);

app.service('user', function () {
  function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  this.toJSON = function () {
    return {name: this.name};
  };

  this.name = 'User ' +  getRandomInt(1, 100);
});

app.controller('userCtrl', function ($scope, user) {
  $scope.user = user;
});

app.controller('inboxCtrl', function ($rootScope, $http, $scope, socket) {
  $scope.tweets = [];

  $http.get('/api/inbox/tweets').success(function (json) {
    $scope.tweets = json.tweets;

    $scope.select(_($scope.tweets).first());
  });

  $scope.select = function (selected) {
    _($scope.tweets).each(function (tweet) {
      tweet.selected = tweet.url === selected.url;
    });

    $rootScope.$emit('tweetSelected', selected);
  };

  socket.on('tweet', function (tweet) {
    var existing = _($scope.tweets).findWhere({url: tweet.url});

    if (existing)
      _(existing).extend(tweet);
    else
      $scope.tweets.push(tweet);
  });
});

app.controller('tweetCtrl', function ($rootScope, $http, $scope, socket, user) {
  $rootScope.$on('tweetSelected', function ($event, tweet) {
    $scope.tweet = tweet;
    $scope.comments = [];

    if (!tweet)
      return;

    $http.get(tweet.url + '/comments').success(function (json) {
      $scope.comments = json.comments;
    });

    $scope.comment = getNewComment();

    $scope.sendComment = function () {
      $http.post($scope.tweet.url + '/comments', $scope.comment);

      $scope.comment.date = Date.now();
      $scope.comment.author = user.toJSON();
      $scope.comments.push($scope.comment);

      $scope.comment = getNewComment();
    };

    function getNewComment() {
      return {
        tweet_url: $scope.tweet.url,
        uid: Math.random().toString(16).slice(2),
        body: ''
      };
    }

    socket.on('comment', function (comment) {
      // not the selected tweet: ignore
      if (comment.tweet_url !== $scope.tweet.url)
        return;

      // comment already present: ignore
      if (!!_($scope.comments).findWhere({uid: comment.uid}))
        return;

      $scope.comments.push(comment);
    });
  });
});

app.service('prettyTimeTick', function ($rootScope, $timeout) {
  function triggerTick() {
    $rootScope.$emit('prettyTimeTick');
    $timeout(triggerTick, 30000);
  }

  triggerTick();
});

app.directive('prettyTime', function ($rootScope, $parse, prettyTimeTick) {
  function shortTime(time) {
    var elapsed = (Date.now() - time) / 1000;

    if (elapsed < 60)
      return 'now';
    else if (elapsed < 60*60)
      return Math.floor(elapsed/60) + 'm';
    else if (elapsed < 3600*24)
      return Math.floor(elapsed/3600) + 'h';
    else
      return Math.floor(elapsed/86400) + 'd';
  }

  return {
    link: function (scope, element, attr) {
      var model = $parse(attr.prettyTime);

      function refresh() {
        element.text(shortTime(model(scope)));
      }

      $rootScope.$on('prettyTimeTick', refresh);
      refresh();
    }
  };
});

app.service('socket', function ($rootScope) {
  var socket = io.connect();

  this.on = function (eventName, callback) {
    socket.on(eventName, function () {
      var args = arguments;

      $rootScope.$apply(function () {
        callback.apply(socket, args);
      });
    });
  };
});