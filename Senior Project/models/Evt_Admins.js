var mongoose = require('mongoose');
var User = mongoose.model('User');

var Evt_AdminSchema = User.discriminator('Evt_Admin',
    new mongoose.Schema({
        'events' : []
    }, {collection : 'evt_admins', versionKey : false})
);

mongoose.model('Evt_Admin', Evt_AdminSchema);