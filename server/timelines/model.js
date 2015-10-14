var mongoose  = require('mongoose');
var Tweet = require('../tweets/model.js').schema;

var TimelineSchema = new mongoose.Schema({
  user_id: String,
  since_id: String,
  last_updated: { type: Date, default: Date.now },
  tweets: [ Tweet ]
});

module.exports = mongoose.model('timeline', TimelineSchema);