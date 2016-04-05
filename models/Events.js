var mongoose = require('mongoose');

var EventSchema = new mongoose.Schema({
    evt_id: String,
    name: String,
    event_host: String,
    startDate: Date,
    endDate: Date,
    judges: [],
    participating_entities: [],
    winner: String
}, { collection : 'events', versionKey : false });

mongoose.model('Event', EventSchema);