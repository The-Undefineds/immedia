//Require needed modules
var http = require('http');
var express = require('express');
var bodyParser = require('body-parser');
var youtube = require('./youtube');
var nyt = require('./nyt.js');
var twitter = require('./twitter.js');
var googleImages = require('./googleImages.js');
var searches = require('./searches/controller.js');
var cors = require('express-cors');
var mongoose = require('mongoose');
var cron = require('./cronjob.js');
var twitterStreamingConnection = require('./streamServer.js');

// var news = require('./news.js');

var app = express();
var server = http.createServer(app);
var port = 80;
var url = '192.241.209.214'; //Change url as necessary

twitterStreamingConnection(); //Streaming API for Twitter

mongoose.connect('mongodb://localhost/local', function(error){
  if (error) {
    console.error(error);
  } else {
    console.log('mongo connected');
  }
});

// Activates cron-jobs that update news-tweets every half-hour
// cron.job.start();
// cron.job2.start();

//app.use();
app.use(cors({
  allowedOrigins: ['http://www.immedia.xyz', 'http://immedia.xyz', '192.241.209.214:80']
}))

app.use(express.static('dist'));
app.use(express.static('./client/assets'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//Please put code in here//

/* The would-be code for youtube. v2.0
Explanation: 
  v2.0 will send back title, date, videoId, and thumbnails 
  v2.0 only sends back the first video on the list */
app.post('/api/youtube', youtube.search);

app.post('/api/nyt', nyt.getArticles);

app.post('/api/twitter', twitter.getTweetsPerson);

app.post('/api/news', twitter.getNewsTweets);

app.get('/api/googleImages', googleImages.getImage);

app.post('/searches/incrementSearchTerm', searches.incrementSearchTerm);

app.get('/searches/popularSearches', searches.getPopularSearches);


///////////////////////////

app.listen(port, url);
console.log('Now listening to... ' + url + ':' + port);

module.exports = app;
