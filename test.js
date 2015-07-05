var should = require('should');
var supertest = require('supertest');
var server = supertest.agent('http://localhost:3000');
describe('redisSession',function(){
    it('should access home page',function(done){
        server
        .get('/')
        .expect(200)
        .end(function(err,res){
          res.status.should.equal(200);
          done();
        });
    });

    it('should return 404',function(done){
        server
        .get('/random')
        .expect(404)
        .end(function(err,res){
            res.status.should.equal(404);
            done();
        });
    });

    it('should return correct login',function(done){
        server
          .post('/login')
          .send({user_email : 'rwtc66@gmail.com', user_password : 'shahid'})
          .expect('Content-Type', /json/)
          .expect(200)
          .end(function(err,res){
            res.body.error.should.equal(false);
            done();
          });
    });

    it('should return incorrect login',function(done){
        server
          .post('/login')
          .send({user_email : 'shahid@abc.com', user_password : 'abc'})
          .expect('Content-Type', /json/)
          .expect(200)
          .end(function(err,res){
            res.body.error.should.not.equal(false);
            done();
          });
    });
});
