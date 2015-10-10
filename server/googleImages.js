var keys = require('./keys.js');
var request = require('request');
var url = require('url');

module.exports = {
  getImage: function(req, res) {
    var urlObj = url.parse(req.url);
    var searchTerm = urlObj.search.substring(3);

    var googleCustomApiUrl = 'https://www.googleapis.com/customsearch/v1?';
    var queryString = googleCustomApiUrl + 'q=' + searchTerm + '&cx=' + keys.googleImagesEngineID + '&imgType=photo&key=' + keys.googleImages;

    request(queryString, function(error, response) {
      if(error) console.error(error);

      var body = JSON.parse(response.body);
      if(body['items']) {
        for(var key in body['items']) {
          var pageMap = body['items'][key]['pagemap'];
          if(pageMap && pageMap.hasOwnProperty('cse_image')) {
            res.status(200).send({image: pageMap['cse_image']['0']['src']});
            break;
          }
        }
      }
      res.end();
    });
    return;
  }
};