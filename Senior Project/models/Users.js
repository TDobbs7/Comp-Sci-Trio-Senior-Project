var mongoose = require('mongoose');

var UserSchema = new mongoose.Schema({
    username: String,
    password: String,
    user_role: String,
    last_login: Date,
    last_update: Date,
    last_updated_by: String
}, {collection : 'users'});

mongoose.model('User', UserSchema);