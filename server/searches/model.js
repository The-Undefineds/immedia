var mongoose  = require('mongoose');

var SearchesSchema = new mongoose.Schema({
  wiki_url: {
    type: String,
    required: true,
    unique: true
  },
  count: Array,
  total: Number,
  search_term: String
});

module.exports = mongoose.model('searches', SearchesSchema);