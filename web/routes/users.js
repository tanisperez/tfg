var path = require('path');
var api = require('../api');
var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  if (req.session.logged) {
    api.users(req.session.username, req.session.password, function(statusCode, body) {
      if (statusCode == 200) {
        res.render('users', { username : req.session.username, data : JSON.parse(body) });
      }  
      // else 
        // Redirigir a errores propios: 404, 500, etc...
    });
  } else 
    res.redirect('/');
});

router.post('/', function(req, res, next) {
  if (req.session.logged) {
    api.groups(req.session.username, req.session.password, function(statusCode, body) {
      if (statusCode == 200) {
        var groups = JSON.parse(body);
        
        var groupId = groups[1]._id;
        if (req.body.group.toLowerCase() === "admin")
          groupId = groups[0]._id;
          
        var dateOfBirth = new Date(req.body.dateOfBirth);
        var newUser = {
					'login' : req.body.login,
					'password' : req.body.password,
					'groups' : [{
						'_id' : groupId,
					}],
					'data' : {
						'name' : req.body.firstName,
						'secondName' : req.body.lastName,
						'dateOfBirth' : dateOfBirth.toLocaleString()
					}
				};
        
        api.addUser(req.session.username, req.session.password, newUser, function(statusCode, body) {
          res.status(statusCode).send(body);
        });
      } else  
        res.status(statusCode).send(body);
    });
  } else 
    res.sendStatus(401);
});

router.delete('/:login', function(req, res, next) {
  if (req.session.logged) {
    api.deleteUser(req.session.username, req.session.password, req.params.login, function(statusCode, body) {
      res.status(statusCode).send(body);
    });
  } else 
    res.redirect('/');
});

module.exports = router;
