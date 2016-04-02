var express = require('express');
var router = express.Router();

var mongoose = require('mongoose');
var User = mongoose.model('User');

/* GET users listing. */
router.get('/', function(req, res, next) {
  User.find(function(err, users) {
    if (err) return next(err);

    if (!users) res.status(404).json({"success" : "false", "message" : "No users found"});
    else res.json({"success" : "true", "users" :users, "timestamp" : new Date(new Date().getTime())});
  });
});

router.get('/:username', function(req, res, next) {
  User.findOne({"username" : req.params.username}, function(err, user) {
    if (err) return next(err);

    if (!user) res.status(401).json({'message' :"User " + req.params.username + " not found"});
    else res.json({"user" :user, "timestamp" : new Date(new Date().getTime())});
  });
});

router.post('/', function(req, res, next) {
  var user = new User(req.body);

  user.save(function(err) {
    if (err) return next(err);

    res.send(JSON.parse(JSON.stringify({"timestamp" : new Date(new Date().getTime()).toUTCString()})));
  });
});

router.post('/login', function(req, res, next) {
    var username = req.body.username;
    var password = req.body.password;

    User.findOne({'username' : username, 'password' : password}, 'username user_role last_login', function(err,user) {
        if (err) return next(err);


        if (!user) res.json({"success" : "false", "message" : "Invalid username and/or password"});
        else {
            var timestamp = new Date(new Date().getTime()).toLocaleString();
            res.json({"success" : "true", "user" : user, "timestamp" : timestamp});
        }
    });
});

router.put('/:username', function(req, res, next) {
  var aUser = new User(req.body);

  User.findOne({"username" : req.params.username}, function(err, user) {
    if (err) return next(err);
    if (!user) res.status(500).json({"message" : "User " + req.params.username + " can't be updated at this time"});

    else {
        aUser._id = user._id;
        aUser.last_update = JSON.parse(JSON.stringify({"timestamp" : new Date(new Date().getTime()).toUTCString()}));

        User.update({'username' : req.params.username}, aUser, {'upsert' : true}, function(err2) {
            if (err2) return next(err2);

            res.send(JSON.parse(JSON.stringify({"timestamp" : new Date(new Date().getTime()).toUTCString()})));
        });
    }
  });
});

module.exports = router;
