var request = require('supertest');
var express = require('express');
var expect = require('chai').expect;
var server = require('../server.js');


describe('server', function() {

  //Twitter API
  it('should respond to a POST request to Twitter with a 200 status code', function(done) {
    request(server)
      .post('/api/twitter')
      .send({searchTerm: 'donald trump'})
      .expect(200)
      .end(done);
  });

  it('should respont to a POST request to Twitter by sending back a parsable stringified JSON object', function(done) {
    request(server)
      .post('/api/twitter')
      .send({searchTerm: 'bernie sanders'})
      .expect(200)
      .expect('Content-Type', /json/)
      .expect(function(res) {
        expect(res.body).to.be.an('object');
      })
      .end(done);
    });

  //NYT API
  it('should respond to a POST request to NYT with a 200 status code', function(done) {
    request(server)
      .post('/api/nyt')
      .send({searchTerm: 'donald trump'})
      .expect(200)
      .end(done);
  });

  it('should respond to a POST request to NYT by sending back a parsable stringified JSON', function(done) {
    request(server)
      .post('/api/twitter')
      .send({searchTerm: 'donald trump'})
      .expect(200)
      .expect('Content-Type', /json/)
      .expect(function(res) {
        expect(res.body).to.be.an('object');
      })
      .end(done);
  });

  //YouTube API
  it('should respond to a POST request to YouTube with a 200 status code', function(done) {
    //The callback function passing in the "done" function as a parameter is Mocha's way of testing the response to an asynchronous task
    //Synchronous code does not require the "done" function parameter
    request(server)
      .post('/api/youtube')
      .send({searchTerm: 'donald trump'})
      .expect(200)
      .end(done);
  });

  it('should respond to a POST request to YouTube by sending back a parsable stringified JSON', function(done) {
    request(server)
      .post('/api/twitter')
      .send({searchTerm: 'sarah palin'})
      .expect(200)
      .expect('Content-Type', /json/)
      .expect(function(res) {
        expect(res.body).to.be.an('object');
      })
      .end(done);
  });

  //Twitter News request to the MongoDB database
  it('should respond to a POST request to Twitter News (internal) with a 200 status code', function(done) {
    request(server)
      .post('/api/news')
      .send({searchTerm: 'pope francis'})
      .expect(200)
      .end(done);
  });

  it('should respond to a POST request to Twitter News (internal) by sending back a parsable stringified JSON object', function(done) {
    request(server)
      .post('/api/twitter')
      .send({searchTerm: 'oprah winfrey'})
      .expect(200)
      .expect('Content-Type', /json/)
      .expect(function(res) {
        expect(res.body).to.be.an('object');
      })
      .end(done);
  });

  //Popular Searches request to the MongoDB database
  it('should respond to GET request to Popular Searches (internal) with a 200 status code', function(done) {
    request(server)
      .get('/searches/popularSearches')
      .expect(200)
      .end(done);
  });

  it('should respond to a GET request to Popular Searches (internal) by sending back a parsable stringified JSON object', function(done) {
    request(server)
      .get('/searches/popularSearches')
      .expect(200)
      .expect('Content-Type', /json/)
      .expect(function(res) {
        expect(res.body).to.be.an('object');
      })
      .end(done);
  });

  //Google Images API
  xit('should respond to GET request to Google Images with a 200 status code', function(done) {
    request(server)
      .post('/api/googleImages')
      .send({searchTerm: 'donald trump'})
      .expect(200)
      .end(done);
  });

  xit('should send back parsable stringified JSON', function(done) {
    request(server)
      .post('/api/twitter')
      .send({searchTerm: 'bernie sanders'})
      .expect(200)
      .expect('Content-Type', /json/)
      .end(done)
  });
});

//other tests:
//keys in response objects should be dates
//dates should be within 30 days of today
//twitter responds with objects with twitter id's && profile image url
//ny times responds with url, photo url, author, and snippet