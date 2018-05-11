const puppeteer = require('puppeteer');
const path = require('path');
const getPort = require('get-port');
const serve = require('./serve');

const runTestsInHeadlessChrome = async port => {
  const options = {
    headless: true,
    args: []
  };

  const browser = await puppeteer.launch(options);
  const page = await browser.newPage();
  await page.goto(`http://localhost:${port}/test/`, {
    waitUntil: 'domcontentloaded'
  });
  const consoleMsg = await new Promise(resolve => {
    page.on('console', msg => resolve(msg.text()));
  });
  await browser.close();
  return consoleMsg;
};

(async () => {
  const server = await serve();
  const testResult = await runTestsInHeadlessChrome(server.address().port);
  if (testResult === 'OK') {
    console.log('Tests passed.');
  } else {
    const errors = JSON.parse(testResult);
    errors.map(e => console.log(e));
    console.error(`\n${errors.length} Error(s)`);
  }
  server.close();
})();
