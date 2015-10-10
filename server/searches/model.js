var mongoose  = require('mongoose');

var SearchesSchema = new mongoose.Schema({
  user_id: Number,
  rank: Number,
  weeklyCount: Array,
  total: Number,
  search_term: {
    type: String,
    required: true,
    unique: true
  },
  img: String,
  tweets: Array
});


module.exports = mongoose.model('searches', SearchesSchema);