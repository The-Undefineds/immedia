var mongoose  = require('mongoose');

var SearchesSchema = new mongoose.Schema({
  rank: Number,
  weeklyCount: Array,
  total: Number,
  search_term: {
    type: String,
    required: true,
    unique: true
  },
  img: String
});


module.exports = mongoose.model('searches', SearchesSchema);