var CronJob = require('cron').CronJob;
var updateNewsOrgTweets = require('./tweets/controller.js')

// Calls 'onTick' every hour (10:00AM, 11:00AM, and so on)
var job = new CronJob({
  cronTime: '00 00 * * * 1-7',
  onTick: function() {
    updateNewsOrgTweets();
  },
  start: false,
  timeZone: 'America/Los_Angeles'
});

// Calls 'onTick' every hour (10:30AM, 11:30AM, and so on)
var job2 = new CronJob({
  cronTime: '00 30 * * * 1-7',
  onTick: function() {
    updateNewsOrgTweets();
  },
  start: false,
  timeZone: 'America/Los_Angeles'
});

module.exports = {
  job: job,
  job2: job2
};


