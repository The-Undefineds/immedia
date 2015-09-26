//Require needed modules
var express = require('express');

var app = express();
var port = 3000;
var url = '127.0.0.1'; //Change url as necessary

//app.use();

//Please put code in here//


///////////////////////////

app.listen(port, url);
console.log('Now listening to... ' + url + ':' + port);