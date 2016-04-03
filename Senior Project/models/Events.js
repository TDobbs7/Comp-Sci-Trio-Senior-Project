var mongoose = require('mongoose');
var Evt_Admin = mongoose.model('Evt_Admin');

var EventSchema = new mongoose.Schema({
    name: String,
    event_host: Evt_Admin,
    startDate: Date,
    endDate: Date,
    judges: [],
    participating_entities: [],
    winner: String
} { collection : 'events', versionKey : false });

mongoose.model('Event', EventSchema);