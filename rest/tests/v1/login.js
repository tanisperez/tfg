var assert = require('assert');
var request = require('supertest');  
var mongoose = require('mongoose');
var config = require('../../config');
var User = require('../../models/v1/user.js');
var Group = require('../../models/v1/group.js');
 
var connectionString = 'mongodb://' + config.db.host + ':' + config.db.port + '/' + config.db.name.testing;

describe('Login tests', function() {
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

  describe('GET /login', function() {
    
    /* 200 OK */
    describe('200 OK', function() {
      
      it('User: admin', function(done) {
        request(url)
          .get('/v1/login')
          .auth('admin', 'admin')
          .expect(200)
          .end(function(err, res) {
            if (err)
              done(err);
              
            User.Person
      			.findOne({'login' : 'admin', 'password': 'admin'})
            .select("-password -_id -_type")
      			.populate({path: 'groups'})
      			.exec(function (err, user) {
              if (err)
                done(err);
              assert.equal(res.body, user.toObject().toString());
              done();
            });
          });
      });
      
      it('User: regular user', function(done) {
        request(url)
          .get('/v1/login')
          .auth('user', 'user')
          .expect(200)
          .end(function(err, res) {
            if (err)
              done(err);
            User.Person
      			.findOne({'login' : 'user', 'password': 'user'})
            .select("-password -_id -_type")
      			.populate({path: 'groups'})
      			.exec(function (err, user) {
              if (err)
                done(err);
              assert.equal(res.body, user.toObject().toString());
              done();
            });
          });
      });
      
      it('User: station', function(done) {
        request(url)
          .get('/v1/login')
          .auth('station', 'station')
          .expect(200)
          .end(function(err, res) {
            if (err)
              done(err);
            User.Person
      			.findOne({'login' : 'station', 'password': 'station'})
            .select("-password -_id -_type")
      			.populate({path: 'groups'})
      			.exec(function (err, user) {
              if (err)
                done(err);
              assert.equal(res.body, user.toObject().toString());
              done();
            });
          });
      });
      
    });
    
    /* 401 Unauthorized */
    describe('401 Unauthorized', function(done) {
      
      it('No authorization header', function(done) {
        request(url)
          .get('/v1/login')
          .expect(401)
          .end(function(err, res) {
              if (err)
                done(err);
            done();
          });
      });
      
      it('Bad login', function(done) {
        request(url)
          .get('/v1/login')
          .auth('admin', '')
          .expect(401)
          .end(function(err, res) {
              if (err)
                done(err);
            done();
          });
      });
      
    });

  });
});