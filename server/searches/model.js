var mongoose  = require('mongoose');

var SearchesSchema = new mongoose.Schema({
  count: Array,
  total: Number,
  search_term: {
    type: String,
    required: true,
    unique: true
});

module.exports = mongoose.model('searches', SearchesSchema);