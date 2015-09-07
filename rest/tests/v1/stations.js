var assert = require('assert');
var request = require('supertest');  
var mongoose = require('mongoose');
var config = require('../../config');
var User = require('../../models/v1/user.js');
var Group = require('../../models/v1/group.js');
var Sample = require('../../models/v1/sample.js');
var Utils = require('../../routes/v1/utils.js');
var util = require('util'); 
 
var connectionString = 'mongodb://' + config.db.host + ':' + config.db.port + '/' + config.db.name.testing;

var stationGroupId = "";

Utils.groupExists('Station', function(exists, group) {
  if (exists) 
    stationGroupId = group._id;
  else
    throw new Error('Station group not found!');
});

var sampleId1, sampleId2;

Sample.findOne({'MAC' : 'station'}, function(err, sample) {
  if (err)
    throw err;
  else
    sampleId1 = sample._id; 
});

Sample.findOne({'MAC' : 'station2'}, function(err, sample) {
  if (err)
    throw err;
  else
    sampleId2 = sample._id; 
});

describe('Stations tests', function() {
  var url = 'http://localhost:3000';

  /* Establish connection with the database */
  before(function(done) {
    mongoose.connect(connectionString, function(err) {
    	if (err) {
    		console.log('Couldn\'t connect to ' + connectionString);
    		done(err);
    	}
    	else
        done();
    });							
  });
  
  /* Close database connection on finish */
  after(function(done) {
    mongoose.connection.close();
    done();
  });
  
  /* GET /stations */
  describe('GET /stations', function() {
    
    /* 200 OK */
    describe('200 OK', function() {
      
      it('User: admin', function(done) {
        request(url)
          .get('/v1/stations')
          .auth('admin', 'admin')
          .expect(200)
          .end(function(err, res) {
            if (err)
              done(err);
              
            User.Station
      				.find({'_type' : 'Station'})
      				.populate({path: 'groups'})
      				.select("-password -_id -_type")
      				.exec(function(err, stations) {
      					if (err)
                  done(err);
      					
                assert.equal(JSON.stringify(res.body), JSON.stringify(stations));
                done();
      				});
          });
      });
      
      it('User: regular user', function(done) {
        request(url)
          .get('/v1/stations')
          .auth('user', 'user')
          .expect(200)
          .end(function(err, res) {
            if (err)
              done(err);
              
            User.Station
      				.find({'_type' : 'Station'})
      				.populate({path: 'groups'})
      				.select("-password -_id -_type")
      				.exec(function(err, stations) {
      					if (err)
                  done(err);
      					
                assert.equal(JSON.stringify(res.body), JSON.stringify(stations));
                done();
      				});
          });
      });
      
    });
    
    /* 401 Unauthorized */
    describe('401 Unauthorized', function() {
      
      it('No authorization header', function(done) {
        request(url)
          .get('/v1/stations')
          .expect(401)
          .end(function(err, res) {
              if (err)
                done(err);
            done();
          });
      });
      
      it('Bad login', function(done) {
        request(url)
          .get('/v1/stations')
          .auth('admin', '')
          .expect(401)
          .end(function(err, res) {
              if (err)
                done(err);
            done();
          });
      });
      
    });
    
    /* 403 Forbidden */
    describe('403 Forbidden', function() {
      
      it('User: station', function(done) {
        request(url)
          .get('/v1/stations')
          .auth('station', 'station')
          .expect(403)
          .end(function(err, res) {
              if (err)
                done(err);
            done();
          });
      });
      
    });
  });
    
    
  /* GET /stations/:MAC */
  // Nivel de privilegio: 0, 1, 2.
  describe('GET /stations/:MAC', function(){
  
    /* 200 OK */
    describe('200 OK', function() {
      
      it('User: admin', function(done) {
        request(url)
          .get('/v1/stations/station')
          .auth('admin', 'admin')
          .expect(200)
          .end(function(err, res) {
            if (err)
              done(err);
              
            User.Station
      				.findOne({'login' : 'station'})
      				.populate({path: 'groups'})
      				.select("-password -_id -_type")
      				.exec(function(err, station) {
                if (err)
                  done(err);
                  
                assert.equal(JSON.stringify(res.body), JSON.stringify(station));
                done();
              });
          });
      });
      
      it('User: regular user', function(done) {
        request(url)
          .get('/v1/stations/station')
          .auth('user', 'user')
          .expect(200)
          .end(function(err, res) {
            if (err)
              done(err);
              
            User.Station
      				.findOne({'login' : 'station'})
      				.populate({path: 'groups'})
      				.select("-password -_id -_type")
      				.exec(function(err, station) {
                if (err)
                  done(err);
                  
                assert.equal(JSON.stringify(res.body), JSON.stringify(station));
                done();
              });
          });
      });
      
      it('User: station', function(done) {
        request(url)
          .get('/v1/stations/station')
          .auth('station', 'station')
          .expect(200)
          .end(function(err, res) {
            if (err)
              done(err);
              
            User.Station
    					.findOne({'login' : 'station'})
    					.select("-_id data.wifi data.wifiPassword data.ip data.port data.interval")
    					.exec(function(err, station) {
                if (err)
                  done(err);
                  
                var minimalJSON = util.format('{"wifi":"%s","wifiPassword":"%s","ip":"%s","port":%d,"interval":%d}',
									station.data.wifi, station.data.wifiPassword, station.data.ip, station.data.port, station.data.interval);
                assert.equal(JSON.stringify(res.body), minimalJSON);
                done();
              });
          });
      });
      
    });
    
    /* 401 Unauthorized */
    describe('401 Unauthorized', function() {
      it('No authorization header', function(done) {
        request(url)
          .get('/v1/stations/station')
          .expect(401)
          .end(function(err, res) {
              if (err)
                done(err);
            done();
          });
      });
      
      it('Bad login', function(done) {
        request(url)
          .get('/v1/stations/station')
          .auth('admin', '')
          .expect(401)
          .end(function(err, res) {
              if (err)
                done(err);
            done();
          });
      });
    });
    
    /* 403 Foribdden */
    describe('403 Forbidden', function() {
      it('There is no case for test this', function(done) {
        done();
      });
    });
    
    /* 404 Not Found */
    describe('404 Not Found', function() {
      
      it('Station: prueba', function(done) {
	      request(url)
	        .get('/v1/stations/prueba')
	        .auth('admin', 'admin')
	        .expect(404)
	        .end(function(err, res) {
	            if (err)
	              done(err);
	          done();
	        });
	    });
	    
	    it('Station: prueba2', function(done) {
	      request(url)
	        .get('/v1/stations/prueba2')
	        .auth('admin', 'admin')
	        .expect(404)
	        .end(function(err, res) {
	            if (err)
	              done(err);
	          done();
	        });
	    });
      
    });
    
  });
  
  /* GET /stations/:MAC/data */
  describe('GET /stations/:MAC/data', function() {
    
    /* 200 OK */
    describe('200 OK', function() {
      
      it('User: admin', function(done) {
        request(url)
          .get('/v1/stations/station/data')
          .auth('admin', 'admin')
          .expect(200)
          .end(function(err, res) {
            if (err)
              done(err);
              
            Sample.find({'MAC' : 'station'}, function(err, samples) {
              if (err)
                done(err);
                
              assert.equal(JSON.stringify(res.body), JSON.stringify(samples));
              done();
            });
          });
      });
      
    });
    
    /* 401 Unauthorized */
    describe('401 Unauthorized', function() {
      
      it('No authorization header', function(done) {
        request(url)
          .get('/v1/stations/station/data')
          .expect(401)
          .end(function(err, res) {
              if (err)
                done(err);
            done();
          });
      });
      
      it('Bad login', function(done) {
        request(url)
          .get('/v1/stations/station/data')
          .auth('admin', '')
          .expect(401)
          .end(function(err, res) {
              if (err)
                done(err);
            done();
          });
      });
      
    });
    
    /* 403 Forbidden */
    describe('403 Forbidden', function() {
      
      it('User: station', function(done) {
        request(url)
          .get('/v1/stations/station/data')
          .auth('station', 'station')
          .expect(403)
          .end(function(err, res) {
              if (err)
                done(err);
            done();
          });
      });
      
    });
    
    /* 404 Not Found */
    describe('404 Not Found', function() {
      
      it('Station: prueba', function(done) {
	      request(url)
	        .get('/v1/stations/prueba/data')
	        .auth('admin', 'admin')
	        .expect(404)
	        .end(function(err, res) {
	            if (err)
	              done(err);
	          done();
	        });
	    });
	    
	    it('Station: prueba2', function(done) {
	      request(url)
	        .get('/v1/stations/prueba2/data')
	        .auth('admin', 'admin')
	        .expect(404)
	        .end(function(err, res) {
	            if (err)
	              done(err);
	          done();
	        });
	    });
      
    });
  });
  
  /* GET /stations/:MAC/data/:id */
  describe('GET /stations/:MAC/data/:id', function() {
    
    /* 200 OK */
    describe('200 OK', function() {
      
      it('User: admin', function(done) {
        request(url)
          .get('/v1/stations/station/data/' + sampleId1)
          .auth('admin', 'admin')
          .expect(200)
          .end(function(err, res) {
            if (err)
              done(err);
              
            Sample.findOne({'_id' : sampleId1}, function(err, sample) {
              if (err)
                done(err);
                
              assert.equal(JSON.stringify(res.body), JSON.stringify(sample));
              done();
            });
          });
      });
      
      it('User: regular user', function(done) {
        request(url)
          .get('/v1/stations/station2/data/' + sampleId2)
          .auth('user2', 'user2')
          .expect(200)
          .end(function(err, res) {
            if (err)
              done(err);
              
            Sample.findOne({'_id' : sampleId2}, function(err, sample) {
              if (err)
                done(err);
                
              assert.equal(JSON.stringify(res.body), JSON.stringify(sample));
              done();
            });
          });
      });
      
    });
    
    /* 401 Unauthorized */
    describe('401 Unauthorized', function() {
      
      it('No authorization header', function(done) {
        request(url)
          .get('/v1/stations/station/data/55912cb0d9c4abc8128ac880')
          .expect(401)
          .end(function(err, res) {
              if (err)
                done(err);
            done();
          });
      });
      
      it('Bad login', function(done) {
        request(url)
          .get('/v1/stations/station2/data/55912cb0d9c4abc8128ac882')
          .auth('admin', '')
          .expect(401)
          .end(function(err, res) {
              if (err)
                done(err);
            done();
          });
      });
      
    });
    
    /* 403 Forbidden */
    describe('403 Forbidden', function() {
      
      it('User: station', function(done) {
        request(url)
          .get('/v1/stations/station/data/55912cb0d9c4abc8128ac880')
          .auth('station', 'station')
          .expect(403)
          .end(function(err, res) {
              if (err)
                done(err);
            done();
          });
      });
      
      it('User: station2', function(done) {
        request(url)
          .get('/v1/stations/station2/data/55912cb0d9c4abc8128ac882')
          .auth('station2', 'station2')
          .expect(403)
          .end(function(err, res) {
              if (err)
                done(err);
            done();
          });
      });
      
    });
    
    /* 404 Not Found */
    describe('404 Not Found', function() {
      
      it('Station not found', function(done) {
	      request(url)
	        .get('/v1/stations/station3/data/55912cb0d9c4abc8128ac880')
	        .auth('admin', 'admin')
	        .expect(404)
	        .end(function(err, res) {
	            if (err)
	              done(err);
                else
	          done();
	        });
	    });
      
      it('Sample not found', function(done) {
	      request(url)
	        .get('/v1/stations/station/data/55912cb0d9c4abc8122ac880')
	        .auth('admin', 'admin')
	        .expect(404)
	        .end(function(err, res) {
	            if (err)
	              done(err);
                else
	          done();
	        });
	    });
      
    });
  });
  
  /* POST /stations */
  describe('POST /stations', function() {
    
    /* 201 Created */
    describe('201 Created', function() {
      
      it('Station3 by admin', function(done) {
        request(url)
          .post('/v1/stations')
          .auth('admin', 'admin')
          .send({
  					'login' : 'station3',
  					'password' : 'station3',
  					'groups' : [{
  						'_id' : stationGroupId,
  					}],
  					'data' : {
  						'location' : 'localhost',
  						'wifi' : 'R-wlan2B',
  						'wifiPassword' : 'lagafadeoro',
  						'ip' : '192.168.0.16',
  						'port' : 3000,
  						'interval' : 16
  					}
          })
          .expect(201)
          .end(function(err, res) {
            if (err)
              done(err);
            else
              done();
          });
      });
      
      it('Station4 by admin2', function(done) {
        request(url)
          .post('/v1/stations')
          .auth('admin2', 'admin2')
          .send({
  					'login' : 'station4',
  					'password' : 'station4',
  					'groups' : [{
  						'_id' : stationGroupId,
  					}],
  					'data' : {
  						'location' : 'localhost',
  						'wifi' : 'R-wlan2B',
  						'wifiPassword' : 'lagafadeoro',
  						'ip' : '192.168.0.16',
  						'port' : 3000,
  						'interval' : 16
  					}
          })
          .expect(201)
          .end(function(err, res) {
            if (err)
              done(err);
            else
              done();
          });
      });
      
    });
    
    /* 400 Bad Request */
    describe('400 Bad Request', function() {
      
      it('Invalid _type', function(done) {
        request(url)
          .post('/v1/stations')
          .auth('admin2', 'admin2')
          .send({
            '_type' : 'Estación',
  					'login' : 'station10',
  					'password' : 'station10',
  					'groups' : [{
  						'_id' : stationGroupId,
  					}],
  					'data' : {
  						'location' : 'localhost',
  						'wifiSSID' : 'R-wlan2B',
  						'wifiPassword' : 'lagafadeoro',
  						'restIP' : '192.168.0.16',
  						'restPort' : 3000,
  						'samplesInterval' : 16
  					}
          })
          .expect(400)
          .end(function(err, res) {
            if (err)
              done(err);
            else
              done();
          });
      });
      
      it('Login is required', function(done) {
        request(url)
          .post('/v1/stations')
          .auth('admin2', 'admin2')
          .send({
  					'password' : 'station10',
  					'groups' : [{
  						'_id' : stationGroupId,
  					}],
  					'data' : {
  						'location' : 'localhost',
  						'wifiSSID' : 'R-wlan2B',
  						'wifiPassword' : 'lagafadeoro',
  						'restIP' : '192.168.0.16',
  						'restPort' : 3000,
  						'samplesInterval' : 16
  					}
          })
          .expect(400)
          .end(function(err, res) {
            if (err)
              done(err);
            else
              done();
          });
      });
      
      it('Login already exists', function(done) {
        request(url)
          .post('/v1/stations')
          .auth('admin2', 'admin2')
          .send({
  					'login' : 'station',
  					'password' : 'station10',
  					'groups' : [{
  						'_id' : stationGroupId,
  					}],
  					'data' : {
  						'location' : 'localhost',
  						'wifiSSID' : 'R-wlan2B',
  						'wifiPassword' : 'lagafadeoro',
  						'restIP' : '192.168.0.16',
  						'restPort' : 3000,
  						'samplesInterval' : 16
  					}
          })
          .expect(400)
          .end(function(err, res) {
            if (err)
              done(err);
            else
              done();
          });
      });
      
      it('Password is required', function(done) {
        request(url)
          .post('/v1/stations')
          .auth('admin2', 'admin2')
          .send({
  					'login' : 'station',
  					'groups' : [{
  						'_id' : stationGroupId,
  					}],
  					'data' : {
  						'location' : 'localhost',
  						'wifiSSID' : 'R-wlan2B',
  						'wifiPassword' : 'lagafadeoro',
  						'restIP' : '192.168.0.16',
  						'restPort' : 3000,
  						'samplesInterval' : 16
  					}
          })
          .expect(400)
          .end(function(err, res) {
            if (err)
              done(err);
            else
              done();
          });
      });
      
      it('Groups is required', function(done) {
        request(url)
          .post('/v1/stations')
          .auth('admin2', 'admin2')
          .send({
  					'login' : 'station',
  					'data' : {
  						'location' : 'localhost',
  						'wifiSSID' : 'R-wlan2B',
  						'wifiPassword' : 'lagafadeoro',
  						'restIP' : '192.168.0.16',
  						'restPort' : 3000,
  						'samplesInterval' : 16
  					}
          })
          .expect(400)
          .end(function(err, res) {
            if (err)
              done(err);
            else
              done();
          });
      });
      
      it('At least one group is required', function(done) {
        request(url)
          .post('/v1/stations')
          .auth('admin2', 'admin2')
          .send({
  					'login' : 'station',
  					'groups' : [],
  					'data' : {
  						'location' : 'localhost',
  						'wifiSSID' : 'R-wlan2B',
  						'wifiPassword' : 'lagafadeoro',
  						'restIP' : '192.168.0.16',
  						'restPort' : 3000,
  						'samplesInterval' : 16
  					}
          })
          .expect(400)
          .end(function(err, res) {
            if (err)
              done(err);
            else
              done();
          });
      });
      
      it('Data is required', function(done) {
        request(url)
          .post('/v1/stations')
          .auth('admin2', 'admin2')
          .send({
  					'login' : 'station',
  					'groups' : [{
  						'_id' : stationGroupId,
  					}]
          })
          .expect(400)
          .end(function(err, res) {
            if (err)
              done(err);
            else
              done();
          });
      });
      
      it('Location is required', function(done) {
        request(url)
          .post('/v1/stations')
          .auth('admin2', 'admin2')
          .send({
  					'login' : 'station',
  					'groups' : [{
  						'_id' : stationGroupId,
  					}],
  					'data' : {
  						'wifiSSID' : 'R-wlan2B',
  						'wifiPassword' : 'lagafadeoro',
  						'restIP' : '192.168.0.16',
  						'restPort' : 3000,
  						'samplesInterval' : 16
  					}
          })
          .expect(400)
          .end(function(err, res) {
            if (err)
              done(err);
            else
              done();
          });
      });
      
      it('Rest server IP is required', function(done) {
        request(url)
          .post('/v1/stations')
          .auth('admin2', 'admin2')
          .send({
  					'login' : 'station',
  					'groups' : [{
  						'_id' : stationGroupId,
  					}],
  					'data' : {
              'location' : 'localhost',
  						'wifiSSID' : 'R-wlan2B',
  						'wifiPassword' : 'lagafadeoro',
  						'restPort' : 3000,
  						'samplesInterval' : 16
  					}
          })
          .expect(400)
          .end(function(err, res) {
            if (err)
              done(err);
            else
              done();
          });
      });
      
      it('Rest server port is required', function(done) {
        request(url)
          .post('/v1/stations')
          .auth('admin2', 'admin2')
          .send({
  					'login' : 'station',
  					'groups' : [{
  						'_id' : stationGroupId,
  					}],
  					'data' : {
              'location' : 'localhost',
  						'wifiSSID' : 'R-wlan2B',
  						'wifiPassword' : 'lagafadeoro',
  						'restIP' : '192.168.0.16',
  						'samplesInterval' : 16
  					}
          })
          .expect(400)
          .end(function(err, res) {
            if (err)
              done(err);
            else
              done();
          });
      });
      
      it('Samples interval is required', function(done) {
        request(url)
          .post('/v1/stations')
          .auth('admin2', 'admin2')
          .send({
  					'login' : 'station',
  					'groups' : [{
  						'_id' : stationGroupId,
  					}],
  					'data' : {
              'location' : 'localhost',
  						'wifiSSID' : 'R-wlan2B',
  						'wifiPassword' : 'lagafadeoro',
  						'restIP' : '192.168.0.16',
  						'restPort' : 3000
  					}
          })
          .expect(400)
          .end(function(err, res) {
            if (err)
              done(err);
            else
              done();
          });
      });
      
    });
    
    /* 401 Unauthorized */
    describe('401 Unauthorized', function() {
      
      it('No authorization header', function(done) {
        request(url)
          .post('/v1/stations')
          .expect(401)
          .end(function(err, res) {
              if (err)
                done(err);
            done();
          });
      });
      
      it('Bad login', function(done) {
        request(url)
          .post('/v1/stations')
          .auth('admin', '')
          .send({
  					'login' : 'station5',
  					'password' : 'station5',
  					'groups' : [{
  						'_id' : stationGroupId,
  					}],
  					'data' : {
  						'location' : 'localhost',
  						'wifiSSID' : 'R-wlan2B',
  						'wifiPassword' : 'lagafadeoro',
  						'restIP' : '192.168.0.16',
  						'restPort' : 3000,
  						'samplesInterval' : 16
  					}
          })
          .expect(401)
          .end(function(err, res) {
              if (err)
                done(err);
            done();
          });
      });
      
    });
    
    /* 403 Forbidden */
    describe('403 Forbidden', function() {
      
      it('User: regular user', function(done) {
        request(url)
          .post('/v1/stations')
          .auth('user', 'user')
          .send({
  					'login' : 'station6',
  					'password' : 'station6',
  					'groups' : [{
  						'_id' : stationGroupId,
  					}],
  					'data' : {
  						'location' : 'localhost',
  						'wifiSSID' : 'R-wlan2B',
  						'wifiPassword' : 'lagafadeoro',
  						'restIP' : '192.168.0.16',
  						'restPort' : 3000,
  						'samplesInterval' : 16
  					}
          })
          .expect(403)
          .end(function(err, res) {
              if (err)
                done(err);
            done();
          });
      });
      
      it('User: station', function(done) {
        request(url)
          .post('/v1/stations')
          .auth('station', 'station')
          .send({
  					'login' : 'station7',
  					'password' : 'station7',
  					'groups' : [{
  						'_id' : stationGroupId,
  					}],
  					'data' : {
  						'location' : 'localhost',
  						'wifiSSID' : 'R-wlan2B',
  						'wifiPassword' : 'lagafadeoro',
  						'restIP' : '192.168.0.16',
  						'restPort' : 3000,
  						'samplesInterval' : 16
  					}
          })
          .expect(403)
          .end(function(err, res) {
              if (err)
                done(err);
            done();
          });
      });
      
    });
    
  });
  
  
  /* PUT /stations/:MAC */
  describe('PUT /stations/:MAC', function() {
    
    /* 200 OK */
    describe('200 OK', function() {
      
      it('Editing password', function(done) {
        request(url)
          .put('/v1/stations/station3')
          .auth('admin', 'admin')
          .send({
  					'password' : 'station5'
          })
          .expect(200)
          .end(function(err, res) {
              if (err)
                done(err);
            done();
          });
      });
      
      it('Editing location', function(done) {
        request(url)
          .put('/v1/stations/station3')
          .auth('admin', 'admin')
          .send({
            'data' : {
  					   'location' : '127.0.0.1'
            }
          })
          .expect(200)
          .end(function(err, res) {
              if (err)
                done(err);
            done();
          });
      });
      
      it('Editing REST service IP', function(done) {
        request(url)
          .put('/v1/stations/station3')
          .auth('admin', 'admin')
          .send({
            'data' : {
  					   'restIP' : '127.0.0.1'
            }
          })
          .expect(200)
          .end(function(err, res) {
              if (err)
                done(err);
            done();
          });
      });
      
      it('Editing REST service port', function(done) {
        request(url)
          .put('/v1/stations/station3')
          .auth('admin', 'admin')
          .send({
            'data' : {
  					   'restPort' : 3001
            }
          })
          .expect(200)
          .end(function(err, res) {
              if (err)
                done(err);
            done();
          });
      });
      
      it('Editing samples interval', function(done) {
        request(url)
          .put('/v1/stations/station3')
          .auth('admin', 'admin')
          .send({
            'data' : {
  					   'samplesInterval' : 64
            }
          })
          .expect(200)
          .end(function(err, res) {
              if (err)
                done(err);
            done();
          });
      });
      
    });
    
    /* 400 Bad Request */
    describe('400 Bad Request', function() {
      
      /*
      it('Bad format', function(done) {
        request(url)
          .put('/v1/stations/station3')
          .auth('admin', 'admin')
          .send({
            'data\'\'"{}' : {
  					   'samplesInterval' : 64
            }
          })
          .expect(400)
          .end(function(err, res) {
              if (err)
                done(err);
              else
                done();
          });
      });
      */
      
    });
    
    /* 401 Unauthorized */
    describe('401 Unauthorized', function() {
      
      it('No authorization header', function(done) {
        request(url)
          .put('/v1/stations/station')
          .expect(401)
          .end(function(err, res) {
              if (err)
                done(err);
            done();
          });
      });
      
      it('Bad login', function(done) {
        request(url)
          .put('/v1/stations/station')
          .auth('admin', '')
          .send({
  					'password' : 'station5',
  					'data' : {
  						'wifiSSID' : 'R-wlan5B',
  						'wifiPassword' : 'lagafadeoro2'
  					}
          })
          .expect(401)
          .end(function(err, res) {
              if (err)
                done(err);
            done();
          });
      });
      
    });
    
    /* 403 Forbidden */
    describe('403 Forbidden', function() {
      
      it('User: regular user', function(done) {
        request(url)
          .put('/v1/stations/station')
          .auth('user', 'user')
          .send({
  					'password' : 'station5',
  					'data' : {
  						'wifiSSID' : 'R-wlan5B',
  						'wifiPassword' : 'lagafadeoro2'
  					}
          })
          .expect(403)
          .end(function(err, res) {
              if (err)
                done(err);
            done();
          });
      });
      
      it('User: station', function(done) {
        request(url)
          .put('/v1/stations/station')
          .auth('station', 'station')
          .send({
  					'password' : 'station5',
  					'data' : {
  						'wifiSSID' : 'R-wlan5B',
  						'wifiPassword' : 'lagafadeoro2'
  					}
          })
          .expect(403)
          .end(function(err, res) {
              if (err)
                done(err);
            done();
          });
      });
      
    });
    
    /* 404 Not Found */
    describe('404 Not Found', function() {
      
      it('Station: prueba', function(done) {
        request(url)
          .put('/v1/stations/prueba')
          .auth('admin', 'admin')
          .send({
  					'password' : 'station5',
  					'data' : {
  						'wifiSSID' : 'R-wlan5B',
  						'wifiPassword' : 'lagafadeoro2'
  					}
          })
          .expect(404)
          .end(function(err, res) {
              if (err)
                done(err);
            done();
          });
      });
      
      it('Station: prueba2', function(done) {
        request(url)
          .put('/v1/stations/prueba2')
          .auth('admin', 'admin')
          .send({
  					'password' : 'station5',
  					'data' : {
  						'wifiSSID' : 'R-wlan5B',
  						'wifiPassword' : 'lagafadeoro2'
  					}
          })
          .expect(404)
          .end(function(err, res) {
              if (err)
                done(err);
            done();
          });
      });
      
    });
    
    
  });
  
  
  /* DELETE /stations/:MAC */
  describe('DELETE /stations/:MAC', function() {
    
    /* 200 OK */
    describe('200 OK', function() {
      
      it('Station3 by admin', function(done) {
        request(url)
          .delete('/v1/stations/station3')
          .auth('admin', 'admin')
          .expect(200)
          .end(function(err, res) {
            if (err)
              done(err);
            else
              done();
          });
      });
      
      it('Station4 by admin2', function(done) {
        request(url)
          .delete('/v1/stations/station4')
          .auth('admin2', 'admin2')
          .expect(200)
          .end(function(err, res) {
            if (err)
              done(err);
            else
              done();
          });
      });
      
    });
    
    /* 401 Unauthorized */
    describe('401 Unauthorized', function() {
      
      it('No authorization header', function(done) {
        request(url)
          .delete('/v1/stations/station')
          .expect(401)
          .end(function(err, res) {
              if (err)
                done(err);
            done();
          });
      });
      
      it('Bad login', function(done) {
        request(url)
          .delete('/v1/stations/station2')
          .auth('admin', '')
          .expect(401)
          .end(function(err, res) {
              if (err)
                done(err);
            done();
          });
      });
      
    });
    
    /* 403 Forbidden */
    describe('403 Forbidden', function() {
      
      it('User: regular user', function(done) {
        request(url)
          .delete('/v1/stations/station')
          .auth('user', 'user')
          .expect(403)
          .end(function(err, res) {
              if (err)
                done(err);
            done();
          });
      });
      
      it('User: station', function(done) {
        request(url)
          .delete('/v1/stations/station2')
          .auth('station', 'station')
          .expect(403)
          .end(function(err, res) {
              if (err)
                done(err);
            done();
          });
      });
      
    });
    
    /* 404 Not Found */
    describe('404 Not Found', function() {
      
      it('Station: prueba', function(done) {
        request(url)
          .delete('/v1/stations/prueba')
          .auth('admin', 'admin')
          .expect(404)
          .end(function(err, res) {
              if (err)
                done(err);
            done();
          });
      });
      
      it('Station: prueba2', function(done) {
        request(url)
          .delete('/v1/stations/prueba2')
          .auth('admin', 'admin')
          .expect(404)
          .end(function(err, res) {
              if (err)
                done(err);
            done();
          });
      });
      
    });
    
  });
  
  
});