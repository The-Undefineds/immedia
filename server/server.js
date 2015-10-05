//Require needed modules
var http = require('http');
var express = require('express');
var bodyParser = require('body-parser');
var youtube = require('./youtube');
var nyt = require('./nyt.js');
var twitter = require('./twitter');
var cors = require('express-cors');

var app = express();
var server = http.createServer(app);
var port = process.env.PORT || 3000;
var url = process.env.PORT ? '192.241.209.214':'127.0.0.1'; //Change url as necessary

//app.use();
app.use(cors({
  allowedOrigins: ['localhost:3000', 'http://www.immedia.xyz', 'http://immedia.xyz']
}))

app.use(express.static(('dist')))
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

///////////////////////////

app.listen(port, url);
console.log('Now listening to... ' + url + ':' + port);

module.exports = app;