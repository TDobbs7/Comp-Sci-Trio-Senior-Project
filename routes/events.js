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

router.post('/', function(req, res, next) {
  var event = new Event(req.body);

  event.save(function(err) {
    if (err) return next(err);

    res.send({"timestamp" : new Date(new Date().getTime()).toLocaleString()});
  });
});

router.post('/verify', function(req, res, next) {
    /*var email = req.body.email;
    var password = req.body.password;

    User.findOne({'email' : email, 'password' : password}, function(err,user) {
        if (err) return next(err);

        if (!user) res.status(401).json({"success" : "false", "message" : "Invalid username and/or password"});
        else {
            var doc = {
                "name" : user.name,
                "email" : user.email,
                "last_login" : user.last_login,
                "user_role" : user.user_role
            };

            var timestamp = new Date(new Date().getTime()).toLocaleString();
            res.json({"success" : "true", "user" : doc, "timestamp" : timestamp});
        }
    });*/

    //var code = req.body.code;

    //Event.findOne({'evt_code'})
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

            res.send(JSON.parse(JSON.stringify({"timestamp" : new Date(new Date().getTime()).toUTCString()})));
        });
    }
  });
});

module.exports = router;
