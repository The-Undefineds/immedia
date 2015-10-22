/*
    file: server.js
    - - - - - - - - - - - -
    Server initialization file responsible for the following:
    * serving static HTML pages
    * routing incoming RESTful requests
    * establishing connection to local MongoDB instance
    * establishing connection to perpetual Twitter Streaming API
    * installing middleware
 */

// Required external node modules
var http = require('http');
var express = require('express');
var bodyParser = require('body-parser');
var cors = require('express-cors');
var mongoose = require('mongoose');

// immedia middleware
var youtube = require('./youtube.js');
var nyt = require('./nyt.js');
var twitter = require('./twitter.js');
var googleImages = require('./googleImages.js');
var searches = require('./searches/controller.js');
var twitterStreamingConnection = require('./streamServer.js');

// Set up node.js server and Express app
var app = express();
var server = http.createServer(app);
var port = 3000;
var url = 'localhost'; //Change url as necessary

/* 
    Establish Twitter Streaming connection to continuously
    receive tweets for white-listed news sources to be displayed
    on individual page results. News tweets are parsed and indexed
    for fast retrieval upon query.

    This is commented out since only one connection is allowed
    per Twitter application. Once a Twitter application has been
    registered and corresponding API keys added to ./keys.js,
    may this connection be established.
 */
// twitterStreamingConnection(); //Streaming API for Twitter


// Connect to MongoDB instance running on localhost
mongoose.connect('mongodb://localhost/local', function(error){
  if (error) {
    console.error(error);
  } else {
    console.log('mongo connected');
  }
});

// Serve static HTML files
app.use(express.static('dist'));
app.use(express.static('./client/assets'));

// Install Express middleware
app.use(cors({ allowedOrigins: ['localhost:3000'] }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Handle incoming HTTP requests
app.post('/api/youtube', youtube.search);

app.post('/api/nyt', nyt.getArticles);

app.post('/api/twitter', twitter.getTweetsPerson);

app.post('/api/news', twitter.getNewsTweets);

app.get('/api/googleImages', googleImages.getImage);

app.post('/searches/incrementSearchTerm', searches.incrementSearchTerm);

app.get('/searches/popularSearches', searches.getPopularSearches);


app.listen(port, url);
console.log('Now listening to... ' + url + ':' + port);

module.exports = app;
