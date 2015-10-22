/*
    file: OAuth.js
    - - - - - - - - - - - - - - 
    Twitter's OAuth is notoriously complicated and
    actually advised against reproducing by Twitter itself
    (https://dev.twitter.com/oauth/overview/introduction)

    That said, at the time of this application creation,
    the libraries linked by Twitter to handle OAuth did not
    support the Search API. As such, immedia recreated
    our own OAuth implementation to carry out that requisite function.

    For more information on Twitter's specific authentication process,
    please see this API doc, https://dev.twitter.com/oauth/overview/authorizing-requests
 */

var crypto = require('crypto');     // Required node modules
var key = require('./keys.js');     // API keys file with five different Twitter API keys/secrets

module.exports = function(baseURL, param, aParam){
  if (aParam !== undefined) aParam += '&';
  else aParam = "";
  
  var nonceDomain = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ',
      signingKey = percentEncoding(key.twitterConsumerSecret) + '&' + percentEncoding(key.twitterAccessTokenSecret)
  
  var callBackUrl = 'http://www.immedia.xyz';
  
  var oauthSignatureMethod = 'HMAC-SHA1',
      oauthNonce = '',
      oauthTimestamp = Math.floor(Date.now() / 1000),
      oauthSignature = getOAuthSignature('GET', baseURL, aParam + 'oauth_consumer_key=' + key.twitterConsumer + '&oauth_nonce=' + getOAuthNonce(32) + '&oauth_signature_method=' + oauthSignatureMethod + '&oauth_timestamp=' + oauthTimestamp + '&oauth_token=' + key.twitterAccessToken + '&oauth_version=1.0&' + param);
  
  var authHeader = 'OAuth oauth_consumer_key=\"' + percentEncoding(key.twitterConsumer) + '\", oauth_nonce=\"' + percentEncoding(oauthNonce) + '\", oauth_signature=\"' + percentEncoding(oauthSignature) + '\", oauth_signature_method=\"' + oauthSignatureMethod + '\", oauth_timestamp=\"' + oauthTimestamp + '\", oauth_token=\"' + percentEncoding(key.twitterAccessToken) + '\", oauth_version=\"1.0\"';
      
  return authHeader;
  
  function getOAuthNonce(numChars) {
  var result = '';
  
  for(var i = 0; i < numChars; i++) {
    result += nonceDomain[Math.floor(Math.random() * (nonceDomain.length))];
  }
  oauthNonce = result;
  return result;
};

function getOAuthSignature(method, baseURL, params) {
  var oauthSignature = percentEncoding(method) + '&' + percentEncoding(baseURL) + '&' + percentEncoding(params);
  
  return crypto.createHmac('sha1', signingKey).update(oauthSignature).digest('base64');
};

function percentEncoding(string) {
  var result = '';
  
  var percentEncoding = {
    '/': '%2F',
    ':': '%3A',
    '=': '%3D',
    '&': '%26',
    ' ': '%2520',
    '+': '%252B',
    ',': '%252C',
    '!': '%2521'
    // '.': '%2E'
  };

  for(var i = 0; i < string.length; i++) {
    result += (percentEncoding[string[i]] || string[i]);
  }
  
  return result;
};
}