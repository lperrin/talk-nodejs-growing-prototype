var app = angular.module('app', []);

app.controller('inboxCtrl', function ($rootScope, $http, $scope) {
  $scope.messages = [];

  $http.get('/api/inbox/messages').success(function (json) {
    $scope.messages = json.messages;

    $scope.selectMessage(_($scope.messages).first());
  });

  $scope.selectMessage = function (selected) {
    _($scope.messages).each(function (message) {
      message.selected = message.url === selected.url;
    });

    $rootScope.$emit('messageSelected', selected);
  };
});

app.controller('messageCtrl', function ($rootScope, $http, $scope, socket) {
  $rootScope.$on('messageSelected', function ($event, message) {
    $scope.message = message;

    $http.get(message.url + '/comments').success(function (json) {
      $scope.comments = json.comments;
    });

    $scope.comment = getNewComment();

    $scope.sendComment = function () {

      $http.post($scope.message.url + '/comments', $scope.comment);

      $scope.comment.date = Date.now();
      $scope.comments.push($scope.comment);

      $scope.comment = getNewComment();
    };

    function getNewComment() {
      return {
        message_url: $scope.message.url,
        uid: Math.random().toString(16).slice(2),
        body: '',
        author: {name: 'Me'}
      };
    }

    socket.on('comment', function (comment) {
      // not the correct message: ignore
      if (comment.message_url !== $scope.message.url)
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