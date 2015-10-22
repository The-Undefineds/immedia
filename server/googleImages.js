/*
    file: googleImages.js
    - - - - - - - - - - - - - - 
    Middleware that sends a request to Google's
    Custom Search API for only image results. This
    handling is used only in the event that a Wikipedia
    article does not include a photo in the Infobox.
 */
var keys = require('./keys.js');
var request = require('request');
var url = require('url');

module.exports = {
  getImage: function(req, res) {
    var urlObj = url.parse(req.url);
    var searchTerm = urlObj.search.substring(3);

    var googleCustomApiUrl = 'https://www.googleapis.com/customsearch/v1?';
    var queryString = googleCustomApiUrl + 'q=' + searchTerm + '&cx=' + keys.googleImagesEngineID + '&imgType=photo&key=' + keys.googleImages;

    request(queryString, function(error, response, body) {
      if(error) res.status(404).send(error);

      if(body) {
        body = JSON.parse(body);
      } else {
        res.status(204).send('No images for that query');
      }

      // Gets the top image result for the given query
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