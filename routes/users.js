var express = require('express');
var router = express.Router();

var mongoose = require('mongoose');
var User = mongoose.model('User');

/* GET users listing. */
router.get('/', function(req, res, next) {
  User.find(function(err, users) {
    if (err) return next(err);

    if (!users) res.status(404).json({"success" : "false", "message" : "No users found"});
    else res.json({"users" :users, "timestamp" : new Date(new Date().getTime())});
  });
});

router.get('/:email', function(req, res, next) {
  User.findOne({"email" : req.params.email}, function(err, user) {
    if (err) return next(err);

    if (!user) res.status(404).json({'message' :"User with Email" + req.params.email + " not found"});
    else res.json({"user" : user, "timestamp" : new Date(new Date().getTime())});
  });
});

router.post('/', function(req, res, next) {
  var user = new User(req.body);
user.user_role= "regular";

  user.save(function(err) {
    if (err) return next(err);

    res.send({"timestamp" : new Date(new Date().getTime()).toUTCString()});
  });
});

router.post('/login', function(req, res, next) {
    var email = req.body.email;
    var password = req.body.password;

    User.findOne({'email' : email, 'password' : password}, function(err,user) {
        if (err) return next(err);

        if (!user) res.status(401).json({"message" : "Invalid username and/or password"});
        else {
            var doc = {
                "name" : user.name,
                "email" : user.email,
                "last_login" : user.last_login,
                "user_role" : user.user_role
            };

            var timestamp = new Date(new Date().getTime()).toLocaleString();
            res.json({"user" : doc, "timestamp" : timestamp});
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

            res.send(JSON.parse(JSON.stringify({"timestamp" : new Date(new Date().getTime()).toUTCString()})));
        });
    }
  });
});

module.exports = router;
