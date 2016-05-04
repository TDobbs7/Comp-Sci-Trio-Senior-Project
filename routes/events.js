var express = require('express');
var router = express.Router();

var mongoose = require('mongoose');
var Event = mongoose.model('Event');

/* GET users listing. */
router.get('/', function(req, res, next) {
    Event.find(function(err, events) {
        if (err) return next(err);

        if (!events) res.status(404).json({"message" : "No events found"});
        else res.json({"events" : events, "timestamp" : new Date(new Date().getTime()).toLocaleString()});
    });
});

router.get('/', function(req, res, next) {
    var email = req.body.email;

    Event.find({}, function(err, events) {
        if (err) return
    });
});

router.get('/:evt_id', function(req, res, next) {
    Event.findOne({"evt_id" : req.params.evt_id}, function(err, event) {
        if (err) return next(err);

        if(!event) res.status(404).json({"message" : "No event found"});
        else res.json({"event" : event, "timestamp" : new Date(new Date().getTime()).toLocaleString()});
    });
});

router.post('/', function(req, res, next) {
    var event = new Event(req.body);

    event.save(function(err) {
        if (err) return next(err);

        res.send({"timestamp" : new Date(new Date().getTime()).toLocaleString()});
    });
});

router.post('/verify', function(req, res, next) {
    var code = req.body.evt_code;
    var email = req.body.email;

    Event.findOne({'evt_id' : code}, function(err, event) {
        if (err) return next(err);
        if (!event) res.status(401).json({'message' : 'Invalid Event Code'});
        else {
            var found = false;
            for (var index in event.judges) {
                if (event.judges[index].address == email) {
                    found = true;
                    res.json({'event' : event, "timestamp" : new Date(new Date().getTime()).toLocaleString()});
                }
            }

            if(!found) res.status(401).json({'message' : 'You are not authorized to judge this event!'});
        }
    });
});

router.put('/:email', function(req, res, next) {
    var aUser = new User(req.body);

    User.findOne({"email" : req.params.email}, function(err, user) {
        if (err) return next(err);
        if (!user) res.status(404).json({"message" : "User " + req.params.email + " can't be updated at this time"});

        else {
            aUser._id = user._id;

            User.update({'email' : req.params.email}, aUser, {'upsert' : true}, function(err2) {
                if (err2) return next(err2);

                res.send({"timestamp" : new Date(new Date().getTime()).toUTCString()});
            });
        }
    });
});

module.exports = router;
