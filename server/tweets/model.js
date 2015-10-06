var mongoose  = require('mongoose');

var TweetsSchema = new mongoose.Schema({
  tweet_id: {
    type: Number,
    required: true,
    unique: true
  },
  created_at: String,
  text: String,
  url: String,
  retweet_count: Number,
  tweeted_by: String,
  search_tags: Array
});

module.exports = mongoose.model('tweets', TweetsSchema);