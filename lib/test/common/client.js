var should = require('should'),
    _ = require('underscore'),
    request = require('request');

function Client() {
  this.reset();
}

Client.prototype.setEndpoint = function (endpoint) {
  this.endpoint = endpoint;
};

Client.prototype.reset = function () {
  this.endpoint = null;
};

Client.prototype.get = function (path, expectedCode, done) {
  request.get({
    url: this.endpoint + path,
    json: true
  }, function (err, response, body) {
    should.not.exist(err);

    if (expectedCode !== response.statusCode)
      console.error('body', body);

    expectedCode.should.eql(response.statusCode);

    done(body);
  });
};

Client.prototype.post = function (path, blob, expectedCode, done) {
  request.post({
    url: this.endpoint + path,
    json: blob || true
  }, function (err, response, body) {
    should.not.exist(err);

    if (expectedCode !== response.statusCode)
      console.error(body);

    expectedCode.should.eql(response.statusCode);

    done(body);
  });
};

Client.prototype.put = function (path, blob, expectedCode, done) {
  request.put({
    url: this.endpoint + path,
    json: blob || true
  }, function (err, response, body) {
    should.not.exist(err);

    if (expectedCode !== response.statusCode)
      console.error(body);

    expectedCode.should.eql(response.statusCode);

    done(body);
  });
};

Client.prototype.delete = function (path, expectedCode, done) {
  request.del({
    url: this.endpoint + path,
    json: true
  }, function (err, response, body) {
    should.not.exist(err);

    if (expectedCode !== response.statusCode)
      console.error(body);

    expectedCode.should.eql(response.statusCode);

    done(body);
  });
};

module.exports = new Client();