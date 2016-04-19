var mongoose = require('mongoose');

var JudgeSchema = new mongoose.Schema({
    'name' : String,
    'email' : String,
    'events_as_judge' : []
}, {collection : 'judges', versionKey : false});

mongoose.model('Judge', JudgeSchema);