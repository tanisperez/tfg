var assert = require('assert');
var request = require('supertest');  
var mongoose = require('mongoose');
var config = require('../../config');
var User = require('../../models/v1/user.js');
var Group = require('../../models/v1/group.js');
 
var connectionString = 'mongodb://' + config.db.host + ':' + config.db.port + '/' + config.db.name.testing;

describe('Groups tests', function() {
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

  /* GET /groups */
  describe('GET /groups', function() {
    
    /* 200 OK */
    describe('200 OK', function() {
      
      it('User: admin', function(done) {
        request(url)
          .get('/v1/groups')
          .auth('admin', 'admin')
          .expect(200)
          .end(function(err, res) {
            if (err)
              done(err);
              
            Group.find(function(err, groups) {
    					if (err)
    						done(err);
                
  						assert.equal(JSON.stringify(res.body), JSON.stringify(groups));
              done();
    				});
          });
      });
      
      it('User: regular user', function(done) {
        request(url)
          .get('/v1/groups')
          .auth('user', 'user')
          .expect(200)
          .end(function(err, res) {
            if (err)
              done(err);
              
            Group.find(function(err, groups) {
    					if (err)
    						done(err);
                
  						assert.equal(JSON.stringify(res.body), JSON.stringify(groups));
              done();
    				});
          });
      });
      
    });
    
    /* 401 Unauthorized */
    describe('401 Unauthorized', function() {
      
      it('No authorization header', function(done) {
        request(url)
          .get('/v1/groups')
          .expect(401)
          .end(function(err, res) {
              if (err)
                done(err);
            done();
          });
      });
      
      it('Bad login', function(done) {
        request(url)
          .get('/v1/groups')
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
          .get('/v1/groups')
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
  
  /* GET /groups/:groupName */
  describe('GET /groups/:groupName', function() {
    
    /* 200 OK */
    describe('200 OK', function() {
      
      describe('Group: Admin', function() {
        
        it('User: admin', function(done) {
          request(url)
            .get('/v1/groups/Admin')
            .auth('admin', 'admin')
            .expect(200)
            .end(function(err, res) {
              if (err)
                done(err);
              
              Group.findOne({'groupName' : 'Admin'}, function(err, group) {
                if (err)
                  done(err);
                  
                assert.equal(JSON.stringify(res.body), JSON.stringify(group));
                done();
              });
            });
        });
        
        it('User: regular user', function(done) {
          request(url)
            .get('/v1/groups/Admin')
            .auth('user', 'user')
            .expect(200)
            .end(function(err, res) {
              if (err)
                done(err);
              
              Group.findOne({'groupName' : 'Admin'}, function(err, group) {
                if (err)
                  done(err);
                  
                assert.equal(JSON.stringify(res.body), JSON.stringify(group));
                done();
              });
            });
        });
        
      });
      
      describe('Group: User', function() {
        
        it('User: admin', function(done) {
          request(url)
            .get('/v1/groups/User')
            .auth('admin', 'admin')
            .expect(200)
            .end(function(err, res) {
              if (err)
                done(err);
              
              Group.findOne({'groupName' : 'User'}, function(err, group) {
                if (err)
                  done(err);
                  
                assert.equal(JSON.stringify(res.body), JSON.stringify(group));
                done();
              });
            });
        });
        
        it('User: regular user', function(done) {
          request(url)
            .get('/v1/groups/User')
            .auth('user', 'user')
            .expect(200)
            .end(function(err, res) {
              if (err)
                done(err);
              
              Group.findOne({'groupName' : 'User'}, function(err, group) {
                if (err)
                  done(err);
                  
                assert.equal(JSON.stringify(res.body), JSON.stringify(group));
                done();
              });
            });
        });
        
      });
      
      describe('Group: Station', function() {
        
        it('User: admin', function(done) {
          request(url)
            .get('/v1/groups/Station')
            .auth('admin', 'admin')
            .expect(200)
            .end(function(err, res) {
              if (err)
                done(err);
              
              Group.findOne({'groupName' : 'Station'}, function(err, group) {
                if (err)
                  done(err);
                  
                assert.equal(JSON.stringify(res.body), JSON.stringify(group));
                done();
              });
            });
        });
        
        it('User: regular user', function(done) {
          request(url)
            .get('/v1/groups/Station')
            .auth('user', 'user')
            .expect(200)
            .end(function(err, res) {
              if (err)
                done(err);
              
              Group.findOne({'groupName' : 'Station'}, function(err, group) {
                if (err)
                  done(err);
                  
                assert.equal(JSON.stringify(res.body), JSON.stringify(group));
                done();
              });
            });
        });
        
      });
      
    });

	/* 401 Unauthorized */
  describe('401 Unauthorized', function() {
    
    it('No authorization header', function(done) {
        request(url)
          .get('/v1/groups/Admin')
          .expect(401)
          .end(function(err, res) {
              if (err)
                done(err);
            done();
          });
      });
      
      it('Bad login', function(done) {
        request(url)
          .get('/v1/groups/Station')
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
    
    describe('Group: Admin', function() {
      
      it('User: Station', function(done) {
        request(url)
          .get('/v1/groups/Admin')
          .auth('station', 'station')
          .expect(403)
          .end(function(err, res) {
              if (err)
                done(err);
            done();
          });
      });
      
    });
    
    describe('Group: User', function() {
      
      it('User: Station', function(done) {
        request(url)
          .get('/v1/groups/User')
          .auth('station', 'station')
          .expect(403)
          .end(function(err, res) {
              if (err)
                done(err);
            done();
          });
      });
      
    });
    
    describe('Group: Station', function() {
      
      it('User: Station', function(done) {
        request(url)
          .get('/v1/groups/Station')
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
    
  	/* 404 Not Found */
  	describe('404 Not Found', function() {
      
  	    it('Group: prueba', function(done) {
  	      request(url)
  	        .get('/v1/groups/prueba')
  	        .auth('admin', 'admin')
  	        .expect(404)
  	        .end(function(err, res) {
  	            if (err)
  	              done(err);
  	          done();
  	        });
  	    });
  	    
  	    it('Group: prueba2', function(done) {
  	      request(url)
  	        .get('/v1/groups/prueba2')
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
  
  /* GET /groups/:groupName/users */
  describe('GET /groups/:groupName/users', function() {
    
    /* 200 OK */
    describe('200 OK', function() {
    
      describe('Group: Admin', function() {
        
        it('User: admin', function(done) {
          request(url)
            .get('/v1/groups/Admin/users')
            .auth('admin', 'admin')
            .expect(200)
            .end(function(err, res) {
              if (err)
                done(err);
              
              Group.findOne({'groupName' : 'Admin'}, function(err, group) {
            		if (err)
                  done(err);
            		
                User.Person
      						.find({'groups' : group._id})
      						.populate({path: 'groups'})
      						.select("-password -_id -_type")
      						.exec(function(err, users) {
      							if (err)
                      done(err);
                      
                    assert.equal(JSON.stringify(res.body), JSON.stringify(users));
                    done();
      						});	
            	});
            });
        });
        
        it('User: regular user', function(done) {
          request(url)
            .get('/v1/groups/Admin/users')
            .auth('user', 'user')
            .expect(200)
            .end(function(err, res) {
              if (err)
                done(err);
              
              Group.findOne({'groupName' : 'Admin'}, function(err, group) {
            		if (err)
                  done(err);
            		
                User.Person
      						.find({'groups' : group._id})
      						.populate({path: 'groups'})
      						.select("-password -_id -_type")
      						.exec(function(err, users) {
      							if (err)
                      done(err);
                      
                    assert.equal(JSON.stringify(res.body), JSON.stringify(users));
                    done();
      						});	
            	});
            });
        });
        
      });
      
      
      describe('Group: User', function() {
        
        it('User: admin', function(done) {
          request(url)
            .get('/v1/groups/User/users')
            .auth('admin', 'admin')
            .expect(200)
            .end(function(err, res) {
              if (err)
                done(err);
              
              Group.findOne({'groupName' : 'User'}, function(err, group) {
            		if (err)
                  done(err);
            		
                User.Person
      						.find({'groups' : group._id})
      						.populate({path: 'groups'})
      						.select("-password -_id -_type")
      						.exec(function(err, users) {
      							if (err)
                      done(err);
                      
                    assert.equal(JSON.stringify(res.body), JSON.stringify(users));
                    done();
      						});	
            	});
            });
        });
        
        it('User: regular user', function(done) {
          request(url)
            .get('/v1/groups/User/users')
            .auth('user', 'user')
            .expect(200)
            .end(function(err, res) {
              if (err)
                done(err);
              
              Group.findOne({'groupName' : 'User'}, function(err, group) {
            		if (err)
                  done(err);
            		
                User.Person
      						.find({'groups' : group._id})
      						.populate({path: 'groups'})
      						.select("-password -_id -_type")
      						.exec(function(err, users) {
      							if (err)
                      done(err);
                      
                    assert.equal(JSON.stringify(res.body), JSON.stringify(users));
                    done();
      						});	
            	});
            });
        });
        
      });
      
      
      describe('Group: Station', function() {
        
        it('User: admin', function(done) {
          request(url)
            .get('/v1/groups/Station/users')
            .auth('admin', 'admin')
            .expect(200)
            .end(function(err, res) {
              if (err)
                done(err);
              
              Group.findOne({'groupName' : 'Station'}, function(err, group) {
            		if (err)
                  done(err);
            		
                User.Person
      						.find({'groups' : group._id})
      						.populate({path: 'groups'})
      						.select("-password -_id -_type")
      						.exec(function(err, users) {
      							if (err)
                      done(err);
                      
                    assert.equal(JSON.stringify(res.body), JSON.stringify(users));
                    done();
      						});	
            	});
            });
        });
        
        it('User: regular user', function(done) {
          request(url)
            .get('/v1/groups/Station/users')
            .auth('user', 'user')
            .expect(200)
            .end(function(err, res) {
              if (err)
                done(err);
              
              Group.findOne({'groupName' : 'Station'}, function(err, group) {
            		if (err)
                  done(err);
            		
                User.Person
      						.find({'groups' : group._id})
      						.populate({path: 'groups'})
      						.select("-password -_id -_type")
      						.exec(function(err, users) {
      							if (err)
                      done(err);
                      
                    assert.equal(JSON.stringify(res.body), JSON.stringify(users));
                    done();
      						});	
            	});
            });
        });
        
      });

    });
    
    /* 401 Unauthorized */
    describe('401 Unauthorized', function() {
      
      it('No authorization header', function(done) {
          request(url)
            .get('/v1/groups/Admin/users')
            .expect(401)
            .end(function(err, res) {
                if (err)
                  done(err);
              done();
            });
        });
        
        it('Bad login', function(done) {
          request(url)
            .get('/v1/groups/Station/users')
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
    
    describe('Group: Admin', function() {
      
      it('User: Station', function(done) {
        request(url)
          .get('/v1/groups/Admin/users')
          .auth('station', 'station')
          .expect(403)
          .end(function(err, res) {
              if (err)
                done(err);
            done();
          });
      });
      
    });
    
    describe('Group: User', function() {
      
      it('User: Station', function(done) {
        request(url)
          .get('/v1/groups/User/users')
          .auth('station', 'station')
          .expect(403)
          .end(function(err, res) {
              if (err)
                done(err);
            done();
          });
      });
      
    });
    
    describe('Group: Station', function() {
      
      it('User: Station', function(done) {
        request(url)
          .get('/v1/groups/Station/users')
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
  
  /* 404 Not Found */
	describe('404 Not Found', function() {
    
	    it('Group: prueba', function(done) {
	      request(url)
	        .get('/v1/groups/prueba/users')
	        .auth('admin', 'admin')
	        .expect(404)
	        .end(function(err, res) {
	            if (err)
	              done(err);
	          done();
	        });
	    });
	    
	    it('Group: prueba2', function(done) {
	      request(url)
	        .get('/v1/groups/prueba2/users')
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