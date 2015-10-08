var mongoose  = require('mongoose');

var TweetsSchema = new mongoose.Schema({
  tweet_id: {
    type: Number,
    unique: true
  },
  created_at: String,
  text: String,
  url: String,
  retweet_count: Number,
  tweeted_by: String,
  topics: Array,
  profile_img: String,
  background_img: String
});

module.exports = mongoose.model('tweets', TweetsSchema);