var mongoose = require('mongoose');

var Evt_AdminSchema = new mongoose.Schema({
    'name' : String,
    'email' : String,
    'events_as_admin' : []
}, {collection : 'evt_admins', versionKey : false});

mongoose.model('Evt_AdminSchema', Evt_AdminSchema);