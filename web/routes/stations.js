var path = require('path');
var api = require('../api');
var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  if (req.session.logged) {
    api.stations(req.session.username, req.session.password, function(statusCode, body) {
      if (statusCode == 200) {
        res.render('stations', { username : req.session.username, data : JSON.parse(body) });
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
        var station = {
          'login': req.body.login,
          'password': req.body.login.split("").reverse().join(""),
          'data': {
              'location': req.body.location,
              'wifi': req.body.wifi,
              'wifiPassword': req.body.wifiPassword,
              'ip': req.body.ip,
              'port': req.body.port,
              'interval': req.body.interval
          },
          'groups': [{
                  '_id': groups[2]._id,
              }]
        };
        api.addStation(req.session.username, req.session.password, station, function(statusCode, body) {
          res.status(statusCode).send(body);
        });
      } else  
        res.status(statusCode).send(body);
    });
    
  } else 
    res.sendStatus(401);
});

router.put('/:MAC', function(req, res, next) {
  if (req.session.logged) {
    console.log(req.body);
    api.updateStationSettings(req.session.username, req.session.password, req.params.MAC, req.body, function(statusCode, body) {
      res.status(statusCode).send(body);
    });
  } else 
    res.sendStatus(401);
});

router.get('/:MAC', function(req, res, next) {
  if (req.session.logged) {
    api.getStation(req.session.username, req.session.password, req.params.MAC, function(statusCode, station) {
      if (statusCode == 200) {
        api.getStationData(req.session.username, req.session.password, req.params.MAC, function(statusCode, body) {
          if (statusCode == 200) {
            res.render('stationName', { username : req.session.username, station: JSON.parse(station), data : JSON.parse(body) });
          }  
          // else 
            // Redirigir a errores propios: 404, 500, etc...
        });
      }
      // else 
        // Redirigir a errores propios: 404, 500, etc...
    });
  } else 
      res.redirect('/');
});

router.delete('/:MAC', function(req, res, next) {
  if (req.session.logged) {
    api.deleteStation(req.session.username, req.session.password, req.params.MAC, function(statusCode, body) {
      res.status(statusCode).send(body);
    });
  } else 
    res.redirect('/');
});

router.delete('/:MAC/data/:id', function(req, res, next) {
  if (req.session.logged) {
    api.deleteStationData(req.session.username, req.session.password, req.params.MAC, req.params.id, function(statusCode, body) {
      res.status(statusCode).send(body);
    });
  } else 
      res.redirect('/');
});

module.exports = router;
