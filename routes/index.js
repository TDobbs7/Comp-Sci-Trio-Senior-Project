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
    var email_data = req.body.email;

    //email_data.recipients.forEach(function(judge) {
        var email = {
            from: email_data.from,
            to: email_data.recipients,
            subject: email_data.subject,
            text: email_data.text
        };

        transporter.sendMail(email, function(err, info){
            if(err) return next(err);

            res.json({'timestamp' : new Date(new Date().getTime())});
        });
    //});

    transporter.close();
});

module.exports = router;
