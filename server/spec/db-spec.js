var request = require('supertest');
var express = require('express');
var expect = require('chai').expect;
var mongoose = require('mongoose');

var Search = require('../searches/model.js');
var Tweet = require('../tweets/model.js');

var server = require('../server.js');


describe('database', function() {

  //The beforeEach function executes before each test in this test block. A test database is created.
  beforeEach(function(done) {
    mongoose.connect('mongodb://localhost/test', function(error){
      if (error) {
        console.error(error);
      } else {
        console.log('mongo connected');
      }
    })
    done();
  });

  //After each test in this test block, the connection is closed so that each test's database connection does
  //not interfere with the others in the test block.
  afterEach(function(done) {
    Search.findOneAndRemove({ search_term: 'donald trump' })
       .then(function() {
        Search.findOneAndRemove({ search_term: 'hillary clinton' })
        })
       .then(function() {
        Search.findOneAndRemove({ search_term: 'bernie sanders' })
       })
      .then(function() {
        mongoose.disconnect();
        done();
      })
  });

  it('should store search terms and corresponding image urls', function(done) {
    request(server)
      .post('/searches/incrementSearchTerm')
      .send({ searchTerm: 'donald trump', img: 'www.fakeImageUrl.com/Donald_Trump' })
      // .expect(200)
      .expect(function(res) {
        Search.findOne({ search_term: 'donald trump '})
          .then(function(term) {
            if (term) {
              expect(term.search_term).to.equal('donald trump');
              expect(term.img).to.equal('www.fakeImageUrl.com/Donald_Trump')
            }
          })
      })
      .end(done);
  });

  it('should increment search total after search term is searched', function(done) {
    request(server)
      .post('searches/incrementSearchTerm')
      .send({ searchTerm: 'donald trump' })

    request(server)
      .post('searches/incrementSearchTerm')
      .send({ searchTerm: 'donald trump' })

    request(server)
      .post('/searches/incrementSearchTerm')
      .send({ searchTerm: 'donald trump' })
      .expect(function(res) {
        Search.findOne({ search_term: 'donald trump'})
          .then(function(term) {
            if (term) {
              expect(term.total).to.equal(3)
            }
          })
      })
      .end(done);
  });

  it('should properly rank search terms based on total searches', function() {
    request(server)
      .post('searches/incrementSearchTerm')
      .send({ searchTerm: 'hillary clinton' })
      .expect(function(res) {
        Search.findOne({ search_term: 'hillary clinton' })
          .then(function(hillary) {
            expect(hillary.rank).to.equal(1);
          })
      })

    request(server)
      .post('searches/incrementSearchTerm')
      .send({ searchTerm: 'bernie sanders' })

    request(server)
      .post('/searches/incrementSearchTerm')
      .send({ searchTerm: 'bernie sanders' })
      .expect(function(res) {
        Search.findOne({ search_term: 'bernie sanders' })
          .then(function(bernie) {
            if (bernie) {
              Search.findOne({ search_term: 'hillary clinton' })
                .then(function(hillary) {
                  expect(bernie.rank).to.equal(1)
                  expect(hillary.rank).to.equal(2)
                })
            }
          })
      })
  });

  // it('should retrieve the most popular search terms', function() {});

  // it('should retrieve news tweets with search term in title or text', function() {});

  // it('should not retrieve news tweets without search term in title or text', function() {});

});

