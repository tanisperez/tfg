var assert = require('assert');
var request = require('supertest');  
var mongoose = require('mongoose');
var config = require('../../config');
var User = require('../../models/v1/user.js');
var Group = require('../../models/v1/group.js');
var Utils = require('../../routes/v1/utils.js');
 
var connectionString = 'mongodb://' + config.db.host + ':' + config.db.port + '/' + config.db.name.testing;

var userGroupId = "", adminGroupId = "";

Utils.groupExists('User', function(exists, group) {
  if (exists) 
    userGroupId = group._id;
  else
    throw new Error('User group not found!');
});

Utils.groupExists('Admin', function(exists, group) {
  if (exists) 
    adminGroupId = group._id;
  else
    throw new Error('Admin group not found!');
});

describe('Users tests', function() {
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
  
  /* GET /users */
  describe('GET /users', function() {
	
  	/* 200 OK */
  	describe('200 OK', function() {
  		
      it('User: admin', function(done) {
        request(url)
          .get('/v1/users')
          .auth('admin', 'admin')
          .expect(200)
          .end(function (err, res) {
            if (err)
              done(err);
              
            User.Person
      				.find({'_type' : 'Person'})
      				.populate({path: 'groups'})
      				.exec(function(err, users) {
      					if (err)
                  done(err);
                  
                assert.equal(JSON.stringify(res.body), JSON.stringify(users));
                done();
      				});  
          });
      });
      
      it('User: regular user', function(done) {
        request(url)
          .get('/v1/users')
          .auth('user', 'user')
          .expect(200)
          .end(function (err, res) {
            if (err)
              done(err);
              
            User.Person
      				.find({'_type' : 'Person'})
      				.populate({path: 'groups'})
      				.exec(function(err, users) {
      					if (err)
                  done(err);
                  
                assert.equal(JSON.stringify(res.body), JSON.stringify(users));
                done();
      				});  
          });
      });
      
  	});
  	
  	/* 401 Unauthorized */
  	describe('401 Unauthorized', function() {
      
      it('No authorization header', function(done) {
        request(url)
          .get('/v1/users')
          .expect(401)
          .end(function(err, res) {
              if (err)
                done(err);
            done();
          });
      });
      
      it('Bad login', function(done) {
        request(url)
          .get('/v1/users')
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
          .get('/v1/users')
          .auth('station', 'station')
          .expect(403)
          .end(function (err, res) {
            if (err)
              done(err);
              
            done();
          });
      });
      
      it('User: station2', function(done) {
        request(url)
          .get('/v1/users')
          .auth('station2', 'station2')
          .expect(403)
          .end(function (err, res) {
            if (err)
              done(err);
              
            done();
          });
      });
      
  	});
		  
  });
  
  /* POST /users */
  describe('POST /users', function() {
    
    /* 201 Created */
    describe('201 Created', function() {
      
      it('Created admin3 by admin', function(done) {
        request(url)
          .post('/v1/users')
          .auth('admin', 'admin')
          .send({
            'login' : 'admin3',
						'password' : 'admin3',
						'groups' : [{
							'_id' : adminGroupId,
						}],
						'data' : {
							'name' : 'Admin3',
							'secondName' : 'user',
							'dateOfBirth' : '1970-01-01 00:00:01'
						}
          })
          .expect(201)
          .end(function(err, res) {
            if (err)
              done(err);

            Utils.userExists('admin3', function(exists, user) {
              if (!exists)
                done(err);
              else
                done();
            });
          });
      });
      
      
      it('Created user3 by admin2', function(done) {
        request(url)
          .post('/v1/users')
          .auth('admin2', 'admin2')
          .send({
            'login' : 'user3',
						'password' : 'user3',
						'groups' : [{
							'_id' : userGroupId,
						}],
						'data' : {
							'name' : 'User3',
							'secondName' : 'user',
							'dateOfBirth' : '1970-01-01 00:00:01'
						}
          })
          .expect(201)
          .end(function(err, res) {
            if (err)
              done(err);

            Utils.userExists('user3', function(exists, user) {
              if (!exists)
                done(err);
              else
                done();
            });
          });
      });
      
    });
    
    /* 400 Bad Request */
    describe('400 Bad Request', function() {
      
      it('Login exists', function(done) {
        request(url)
          .post('/v1/users')
          .auth('admin2', 'admin2')
          .send({
            'login' : 'user',
						'password' : 'user4',
						'groups' : [{
							'_id' : userGroupId,
						}],
						'data' : {
							'name' : 'User4',
							'secondName' : 'user4',
							'dateOfBirth' : '1970-01-01 00:00:01'
						}
          })
          .expect(400)
          .end(function(err, res) {
            if (err)
              done(err);

            done();
          });
      });
      
      it('Password is empty', function(done) {
        request(url)
          .post('/v1/users')
          .auth('admin2', 'admin2')
          .send({
            'login' : 'user4',
						'groups' : [{
							'_id' : userGroupId,
						}],
						'data' : {
							'name' : 'User4',
							'secondName' : 'user4',
							'dateOfBirth' : '1970-01-01 00:00:01'
						}
          })
          .expect(400)
          .end(function(err, res) {
            if (err)
              done(err);

            done();
          });
      });
      
      it('Groups is required', function(done) {
        request(url)
          .post('/v1/users')
          .auth('admin2', 'admin2')
          .send({
            'login' : 'user4',
						'password' : 'user4',
						'data' : {
							'name' : 'User4',
							'secondName' : 'user4',
							'dateOfBirth' : '1970-01-01 00:00:01'
						}
          })
          .expect(400)
          .end(function(err, res) {
            if (err)
              done(err);

            done();
          });
      });
      
      it('At least one group is required', function(done) {
        request(url)
          .post('/v1/users')
          .auth('admin2', 'admin2')
          .send({
            'login' : 'user4',
						'password' : 'user4',
						'groups' : [{
						}],
						'data' : {
							'name' : 'User4',
							'secondName' : 'user4',
							'dateOfBirth' : '1970-01-01 00:00:01'
						}
          })
          .expect(400)
          .end(function(err, res) {
            if (err)
              done(err);

            done();
          });
      });
      
      it('Data is required', function(done) {
        request(url)
          .post('/v1/users')
          .auth('admin2', 'admin2')
          .send({
            'login' : 'user4',
						'password' : 'user4',
						'groups' : [{
              '_id' : userGroupId,
						}]
          })
          .expect(400)
          .end(function(err, res) {
            if (err)
              done(err);

            done();
          });
      });
      
      it('Name is required', function(done) {
        request(url)
          .post('/v1/users')
          .auth('admin2', 'admin2')
          .send({
            'login' : 'user4',
						'password' : 'user4',
						'groups' : [{
							'_id' : userGroupId,
						}],
						'data' : {
							'secondName' : 'user4',
							'dateOfBirth' : '1970-01-01 00:00:01'
						}
          })
          .expect(400)
          .end(function(err, res) {
            if (err)
              done(err);

            done();
          });
      });
      
      it('SecondName is required', function(done) {
        request(url)
          .post('/v1/users')
          .auth('admin2', 'admin2')
          .send({
            'login' : 'user4',
						'password' : 'user4',
						'groups' : [{
							'_id' : userGroupId,
						}],
						'data' : {
							'name' : 'User4',
							'dateOfBirth' : '1970-01-01 00:00:01'
						}
          })
          .expect(400)
          .end(function(err, res) {
            if (err)
              done(err);

            done();
          });
      });
      
      it('DateOfBirth is required', function(done) {
        request(url)
          .post('/v1/users')
          .auth('admin2', 'admin2')
          .send({
            'login' : 'user',
						'password' : 'user4',
						'groups' : [{
							'_id' : userGroupId,
						}],
						'data' : {
							'name' : 'User4',
							'secondName' : 'user4'
						}
          })
          .expect(400)
          .end(function(err, res) {
            if (err)
              done(err);

            done();
          });
      });
      
    });
    
    /* 401 Unauthorized */
    describe('401 Unauthorized', function() {
      
      it('No authorization header', function(done) {
        request(url)
          .post('/v1/users')
          .expect(401)
          .end(function(err, res) {
              if (err)
                done(err);
            done();
          });
      });
      
      it('Bad login', function(done) {
        request(url)
          .post('/v1/users')
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
          .post('/v1/users')
          .auth('user', 'user')
          .expect(403)
          .end(function (err, res) {
            if (err)
              done(err);
              
            done();
          });
      });
      
      it('User: station', function(done) {
        request(url)
          .post('/v1/users')
          .auth('station', 'station')
          .expect(403)
          .end(function (err, res) {
            if (err)
              done(err);
              
            done();
          });
      });
      
    });
    
  });
  
  /* PUT /users/:login */
  describe('PUT /users/:login', function() {
    
    /* 200 OK */
    describe('200 OK', function() {
      
    });
    
    /* 400 Bad Request */
    describe('400 Bad Request', function() {
      
    });
    
    /* 401 Unauthorized */
    describe('401 Unauthorized', function() {
      
       it('No authorization header', function(done) {
        request(url)
          .put('/v1/users/admin2')
          .expect(401)
          .end(function(err, res) {
              if (err)
                done(err);
            done();
          });
      });
      
      it('Bad login', function(done) {
        request(url)
          .put('/v1/users/user2')
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
          .put('/v1/users/admin2')
          .auth('user', 'user')
          .expect(403)
          .end(function (err, res) {
            if (err)
              done(err);
              
            done();
          });
      });
      
      it('User: station', function(done) {
        request(url)
          .put('/v1/users/user3')
          .auth('station', 'station')
          .expect(403)
          .end(function (err, res) {
            if (err)
              done(err);
              
            done();
          });
      });
      
    });
    
    /* 404 Not Found */
    describe('404 Not Found', function() {
      
      it('User: prueba', function(done) {
        request(url)
          .put('/v1/users/prueba')
          .auth('admin', 'admin')
          .expect(404)
          .end(function (err, res) {
            if (err)
              done(err);
              
            done();
          });
      });
      
      it('User: prueba2', function(done) {
        request(url)
          .put('/v1/users/prueba2')
          .auth('admin', 'admin')
          .expect(404)
          .end(function (err, res) {
            if (err)
              done(err);
              
            done();
          });
      });
      
    });
    
    
  });
  
  /* DELETE /users/:login */
  describe('DELETE /users/:login', function() {
    
    /* 200 OK */
    describe('200 OK', function() {
      
      it('Deleted admin3 by admin', function(done) {
        request(url)
          .delete('/v1/users/admin3')
          .auth('admin', 'admin')
          .expect(200)
          .end(function(err, res) {
            if (err)
              done(err);
            else
              Utils.userExists('admin3', function(exists, user) {
                if (exists)
                  done(new Error('Admin3 exists yet!'));
                else
                  done();
              });
          });
      });
      
      it('Deleted user3 by admin2', function(done) {
        request(url)
          .delete('/v1/users/user3')
          .auth('admin2', 'admin2')
          .expect(200)
          .end(function(err, res) {
            if (err)
              done(err);
            else
              Utils.userExists('User3', function(exists, user) {
                if (exists)
                  done(new Error('user3 exists yet!'));
                else
                  done();
              });
          });
      });
      
    });
    
    /* 401 Unauthorized */
    describe('401 Unauthorized', function() {
      
      it('No authorization header', function(done) {
        request(url)
          .delete('/v1/users/admin2')
          .expect(401)
          .end(function(err, res) {
              if (err)
                done(err);
            done();
          });
      });
      
      it('Bad login', function(done) {
        request(url)
          .delete('/v1/users/user3')
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
          .delete('/v1/users/admin2')
          .auth('user', 'user')
          .expect(403)
          .end(function (err, res) {
            if (err)
              done(err);
              
            done();
          });
      });
      
      it('User: station', function(done) {
        request(url)
          .delete('/v1/users/admin2')
          .auth('station', 'station')
          .expect(403)
          .end(function (err, res) {
            if (err)
              done(err);
              
            done();
          });
      });
      
    });
    
    /* 404 Not Found */
    describe('404 Not Found', function() {
      
      it('User: prueba', function(done) {
        request(url)
          .delete('/v1/users/prueba')
          .auth('admin', 'admin')
          .expect(404)
          .end(function (err, res) {
            if (err)
              done(err);
              
            done();
          });
      });
      
      it('User: prueba2', function(done) {
        request(url)
          .delete('/v1/users/prueba2')
          .auth('admin', 'admin')
          .expect(404)
          .end(function (err, res) {
            if (err)
              done(err);
              
            done();
          });
      });
      
    });
    
  });
  
});