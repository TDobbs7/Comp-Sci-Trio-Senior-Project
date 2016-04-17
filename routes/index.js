var express = require('express');
var nodemailer = require('nodemailer');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index.ejs');
});

router.post('/email', function(req, res, next) {
  var smtpConfig = {
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth : {
      user: 'contactus.scored@gmail.com',
      pass: 'compsci123'
    }
  };

  var transporter = nodemailer.createTransport(smtpConfig);
  console.log(req.body.email);
  transporter.sendMail(req.body.email, function(err, info){
    if(err) return next(err);
    console.log("Made it!");
    res.json({'data' : {'info' : info.response, 'timestamp' : new Date(new Date().getTime())}});
  });
});

module.exports = router;
