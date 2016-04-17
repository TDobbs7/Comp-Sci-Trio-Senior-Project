var mongoose = require('mongoose');

var EventSchema = new mongoose.Schema({
    evt_id: String,
    name: String,
    event_host: String,
    start_date: Date,
    end_date: Date,
    judges: [],
    winner: String
}, { collection : 'events', versionKey : false });

mongoose.model('Event', EventSchema);