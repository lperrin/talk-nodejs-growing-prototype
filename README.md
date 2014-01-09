Talk — Growing your prototype
=============================

This is the code used to support a talk I gave at node.js Paris #5. Starting with a barebone app with no database, I progressively add MySQL support and a rudimentary distribution, then proceed to show how the app can still be accurately tested, even if it relies on several external services and runs on 2 servers.

The app is called 'Twont!' (portmanteau of Twitter and Front - http://frontapp.com). The app has (obviously) a node.js backend with an AngularJS frontend (not the focus of this talk). You can switch between branches to see the various states of the project:

* Step01, Step02: Though it doesn't have any database, the app is already mostly working. You can show it to prospective customers, run usability tests, work on your design. It is also very simple to deploy.

* Step03: I add a MySQL driver, wrapped inside a thin adaptor (`sql/index.js`) that we use internally. At this time, it cannot generate join queries. Though it's just of proof of concept, we use it everyday in production

* Step04: I split the app in 2 processes (that you can start with `node app.js api` and `node app.js twitter`), communicating with a redis-based message queue.

* Step05: At this point, running in 2 processes and using 3 different external services, the app should be a nightmare to test. However, we wrote both a MySQL and a full in-memory implementation (sql_mem). sql_mem is **not designed for production**, but makes running tests easy. I also wrote a very basic mq implementation (ee.js) based on an event emitter for the purpose of the talk.

Using a trick with `require`'s interal cache (`transquire.js`), I inject mockups in tests. You can see 5 small tests in `lib/test/test.js`. The first one simulates the asynchronous arrival of a tweet and checks that it triggers Socket.IO events. You can see the coverage report in `cov.html` (above 85%! :)). Check [moquire](https://npmjs.org/package/moquire) or [enhanced-require](https://npmjs.org/package/enhanced-require) for more serious implementations.
