var mongoose  = require('mongoose');

var TweetsSchema = new mongoose.Schema({
  tweet_id: Number,                     
  tweet_id_str: {
    type: String,
    unique: true
  },
  created_at: String,
  url: String,
  retweet_count: Number,
  tweeted_by: String,
  profile_img: String,
  background_img: String,
  text: String
});

module.exports = mongoose.model('tweets', TweetsSchema);