var path = require('path');
var api = require('../api');
var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  if (req.session.logged)
    res.redirect('/stations');
  else
    res.sendFile(path.join(__dirname, '../', 'login.html'));
});

router.post('/', function(req, res, next) {
  var user = req.body.Username;
  var password = req.body.Password;
  api.login(user, password, function(statusCode, body) {
    if (statusCode == 200) {
      req.session.username = user;
      req.session.password = password;
      req.session.profile = body;
      req.session.logged = true;
    }
    res.status(statusCode).send(body);
  });
});

module.exports = router;
