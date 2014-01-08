var _ = require('underscore'),
    config = require('../../../twont-conf.json'),
    driver = require('./' + config.mq);

exports.push = driver.push;

exports.process = driver.process;