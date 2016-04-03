var mongoose = require('mongoose');
var User = mongoose.model('User');

var JudgeSchema = User.discriminator('Judge',
    new mongoose.Schema({
        'events' : []
    }, {collection : 'judges', versionKey : false})
);

mongoose.model('Judge', JudgeSchema);