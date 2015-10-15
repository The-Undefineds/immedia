var mongoose  = require('mongoose');

var TweetsSchema = new mongoose.Schema({
  tweet_id: {
    type: String,
    unique: true
  },
  tweet_id_str: String,
  created_at: String,
  url: String,
  retweet_count: Number,
  favorite_count: Number,
  tweeted_by: String,
  profile_img: String,
  background_img: String,
  text: String,
  user_id: String,
  timestamp: Date
});

module.exports = {
  model: mongoose.model('tweets', TweetsSchema),

  schema: TweetsSchema
};