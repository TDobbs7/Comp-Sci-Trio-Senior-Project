var mongoose = require('mongoose');

var UserSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    user_role: [],
    events_hosting: [],
    events_judging: [],
    last_login: Date
}, {collection : 'users', discriminatorKey: 'kind', versionKey : false});

mongoose.model('User', UserSchema);