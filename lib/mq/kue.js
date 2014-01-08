var kue = require('kue'),
    jobs = kue.createQueue();

exports.push = function (name, data) {
  jobs.create(name, data).save();
};

exports.process = function (name, worker) {
  jobs.process(name, function (job, done) {
    worker(job.data, done);
  });
};