//Require needed modules
var express = require('express');
var youtube = require('./youtube');

var app = express();
var port = 3000;
var url = '127.0.0.1'; //Change url as necessary

//app.use();

app.use(express.static(('dist')))
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
//Please put code in here//

/* The would-be code for youtube. v1.0
Explanation: 
  v1.0 will be sending back a <div> element and a <script> element
  v1.0 /api/youtube sends back a video inside a <div> element 
  v1.0 does not send back any text */
app.post('/api/youtube', function(req, res){
  var itemToSearch = req.body.search;
  youtube(itemToSearch, function(response){
    res.send(response);
  })
  
  /* In case req.body is empty
  req.on('data', function(data){
   var itemToSearch = data.search || data;
   youtube(itemToSearch, function(response){
     res.send(response);
   })  
  }) */
})

///////////////////////////

app.listen(port, url);
console.log('Now listening to... ' + url + ':' + port);

module.exports = app;