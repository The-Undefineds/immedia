var keys = require('./keys.js');
var request = require('request');
var url = require('url');

module.exports = {
  getImage: function(req, res) {
    var urlObj = url.parse(req.url);
    var searchTerm = urlObj.search.substring(3);

    var googleCustomApiUrl = 'https://www.googleapis.com/customsearch/v1?';
    var queryString = googleCustomApiUrl + 'q=' + searchTerm + '&cx=' + keys.googleImagesEngineID + '&key=' + keys.googleImages;

    request(queryString, function(error, response) {
      if(error) console.error(error);

      var body = JSON.parse(response.body);
      if(body['items']) {
        if(body['items']['0']['pagemap']['cse_image']['0']['src']) {
          res.status(200).send({image: body['items']['0']['pagemap']['cse_image']['0']['src']});
        }
      }
      res.end();
    });
    return;
  }
};