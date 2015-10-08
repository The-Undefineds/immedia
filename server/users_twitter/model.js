var mongoose  = require('mongoose');

var UserSchema = new mongoose.Schema({
  user_id: {
    type: Number,
    required: true,
    unique: true
  },
  profile_image: {
    type: String
  },
  background_image: {
    type: String
  }
});

module.exports = mongoose.model('users', UserSchema);