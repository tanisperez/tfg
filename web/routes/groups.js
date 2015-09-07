var path = require('path');
var api = require('../api');
var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  if (req.session.logged) {
    api.groups(req.session.username, req.session.password, function(statusCode, body) {
      if (statusCode == 200) {
        res.render('groups', { username : req.session.username, data : JSON.parse(body) });
      }  
      // else 
        // Redirigir a errores propios: 404, 500, etc...
    });
  } else 
      res.redirect('/');
});

router.get('/:groupName/users', function(req, res, next) {
  if (req.session.logged) {
    api.usersInGroup(req.session.username, req.session.password, req.params.groupName, function(statusCode, body) {
      if (statusCode == 200) {
        res.render('groupName', { username : req.session.username, group : req.params.groupName, data : JSON.parse(body) });
      }  
      // else 
        // Redirigir a errores propios: 404, 500, etc...
    });
  } else 
      res.redirect('/');
});

module.exports = router;
