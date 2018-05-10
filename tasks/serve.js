const express = require('express');
const path = require('path');

const executeImmediately = process.argv[2] === 'execute';

const serve = function(port = 3000) {
  const app = express();
  app.use(express.static(process.cwd(), { extensions: ['js'] }));

  //app config to support tests
  app.get('/http-client-get-test', function(req, res) {
    res.send({ foo: '1' });
  });
  app.post('/http-client-post-test', function(req, res) {
    res.send({ foo: '2' });
  });
  app.get('/http-client-response-not-json', function(req, res) {
    res.send('not json');
  });
  app.get('/http-client-modified-url', function(req, res) {
    res.send('response for modified url');
  });
  //end app config to support tests

  const server = app.listen(port, foo => {
    console.log(`serving on port ${port}`);
    return Promise.resolve();
  });

  return server;
};

module.exports = serve;

if (executeImmediately) {
  serve();
}
