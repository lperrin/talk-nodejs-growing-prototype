var config = require('../twont-conf.json');

function isComponentEnabled(name) {
  var isMain = require.main === module,
      args = process.argv.slice(2);

  return !isMain || args.indexOf(name) >= 0 || args.indexOf('all') >= 0;
}

if (isComponentEnabled('api'))
  require('./lib/api').start();

if (isComponentEnabled('twitter'))
  require('./lib/twitter_stream').start();