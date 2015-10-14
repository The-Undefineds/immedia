var request = require('supertest');
var express = require('express');
var expect = require('chai').expect;
var server = require('../server.js');

describe('server', function() {

  //Twitter API
  it('should respond to a POST request to Twitter with a 200 status code', function(done) {
    request('http://127.0.0.1:3000/api/twitter', function(error, response, body) {
      expect(response.statusCode).to.equal(200);
      done();
    });

  it('should send back parsable stringified JSON', function(done) {
    request('http://127.0.0.1:3000/api/twitter', function(error, response, body) {
      expect(JSON.parse.bind(this, body)).to.not.throw();
      parsedBody = JSON.parse(body);
      expect(parsedBody).to.be.an('object');
      done();
    });
  });

  //NYT API
  it('should respond to a POST request to NYT with a 200 status code', function(done) {
    request('http://127.0.0.1:3000/api/nyt', function(error, response, body) {
      expect(response.statusCode).to.equal(200);
      done();
    });

  it('should send back parsable stringified JSON', function(done) {
    request('http://127.0.0.1:3000/api/nyt', function(error, response, body) {
      expect(JSON.parse.bind(this, body)).to.not.throw();
      parsedBody = JSON.parse(body);
      expect(parsedBody).to.be.an('object');
      done();
    });
  });

  //YouTube API
  it('should respond to a POST request to YouTube with a 200 status code', function(done) {
    request('http://127.0.0.1:3000/api/youtube', function(error, response, body) {
      expect(response.statusCode).to.equal(200);
      done();
    });

  it('should send back parsable stringified JSON', function(done) {
    request('http://127.0.0.1:3000/api/youtube', function(error, response, body) {
      expect(JSON.parse.bind(this, body)).to.not.throw();
      parsedBody = JSON.parse(body);
      expect(parsedBody).to.be.an('object');
      done();
    });
  });

  //Twitter News request to the MongoDB database
  it('should respond to a POST request to Twitter News (internal) with a 200 status code', function(done) {
    request('http://127.0.0.1:3000/api/news', function(error, response, body) {
      expect(response.statusCode).to.equal(200);
      done();
    });

  it('should send back parsable stringified JSON', function(done) {
    request('http://127.0.0.1:3000/api/news', function(error, response, body) {
      expect(JSON.parse.bind(this, body)).to.not.throw();
      parsedBody = JSON.parse(body);
      expect(parsedBody).to.be.an('object');
      done();
    });
  });

  //Popular Searches request to the MongoDB database
  it('should respond to GET request to Popular Searches (internal) with a 200 status code', function(done) {
    request('http://127.0.0.1:3000/api/popularSearches', function(error, response, body) {
      expect(response.statusCode).to.equal(200);
      done();
    });

  it('should send back parsable stringified JSON', function(done) {
    request('http://127.0.0.1:3000/api/popularSearches', function(error, response, body) {
      expect(JSON.parse.bind(this, body)).to.not.throw();
      parsedBody = JSON.parse(body);
      expect(parsedBody).to.be.an('object');
      done();
    });
  });

  //Google Images API
  it('should respond to GET request to Google Images with a 200 status code', function(done) {
    request('http://127.0.0.1:3000/api/googleImages', function(error, response, body) {
      expect(response.statusCode).to.equal(200);
      done();
    });

  it('should send back parsable stringified JSON', function(done) {
    request('http://127.0.0.1:3000/classes/messages', function(error, response, body) {
      expect(JSON.parse.bind(this, body)).to.not.throw();
      parsedBody = JSON.parse(body);
      expect(parsedBody).to.be.an('object');
      done();
    });
  });
})