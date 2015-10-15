var request = require('supertest');
var express = require('express');
var expect = require('chai').expect;
var mongoose = require('mongoose');

var Search = require('../searches/model.js');
var Tweet = require('../tweets/model.js');

var server = require('../server.js');


describe('popular searches', function() {

  //The beforeEach function executes before each test in this test block. A test database is created.
  beforeEach(function(done) {
    mongoose.createConnection('mongodb://localhost/test', function(error){
      if (error) {
        console.error(error);
      } else {
        console.log('mongo connected');
      }
    })
    done();
  });

  //After each test in this test block, test data is removed from the database so it does not interfere with other tests.
  //The connection is closed so that each test's database connection does
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
        mongoose.connection.close();
      })
      done();
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

    //The term 'donald trump' is searched three times, so a search count of 3 is expected.
    request(server)
      .post('/searches/incrementSearchTerm')
      .send({ searchTerm: 'donald trump' })

    request(server)
      .post('/searches/incrementSearchTerm')
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

  it('should properly rank search terms based on total searches', function(done) {

    //The term 'hillary clinton' is searched once, and should have a ranking of 1.
    request(server)
      .post('/searches/incrementSearchTerm')
      .send({ searchTerm: 'hillary clinton' })
      .expect(function(res) {
        Search.findOne({ search_term: 'hillary clinton' })
          .then(function(hillary) {
            expect(hillary.rank).to.equal(1);
          })
      })

    //After 'bernie sanders' is searched twice, the term should overtake 'hillary clinton' as the number 1 ranked term.
    request(server)
      .post('/searches/incrementSearchTerm')
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
      .end(done);
  });

  it('should retrieve the most popular search terms', function(done) {

    request(server)
      .post('/searches/incrementSearchTerm')
      .send({ searchTerm: 'bernie sanders' })
    request(server)
      .post('/searches/incrementSearchTerm')
      .send({ searchTerm: 'hillary clinton' })
    request(server)
      .post('/searches/incrementSearchTerm')
      .send({ searchTerm: 'donald trump' })
      .expect(function(res) {

        request(server)
          .get('/searches/popularSearches')
          .expect(200)
          .expect(function(res) {
            expect(res.body).to.be.an('object');
            expect(res.body['bernie sanders'].rank).to.equal(1);
            expect(res.body['hillary clinton'].rank).to.equal(2);
            expect(res.body['donald trump'].rank).to.equal(3);
          })

      })

      .end(done);
  });
});

describe('news tweets', function() {


  //Before each test, connect to the test database and create a test tweet (based on real Twitter News results)
  beforeEach(function(done) {
    mongoose.createConnection('mongodb://localhost/test', function(error){
      if (error) {
        console.error(error);
      } else {
        console.log('mongo connected');
      }
    });
    Tweet.create({ date: 'Wed Sep 23 13:08:45 +0000 2008',
      tweet_id_str: '646673231139733504',
      text: 'Hillary Clinton challenged drugmakers over “outrageous” price increases. It may have worked.' })
    done();
  });

  afterEach(function(done) {
    Tweet.findOneAndRemove({ tweet_id_str: '646673231139733504' })
    mongoose.connection.close();
    done();
  })

  it('should retrieve news tweets with search term in title or text', function(done) {
    request(server)
      .post('/api/news')
      .send({ searchTerm: 'hillary clinton' })
      .expect(function(res) {
        expect(res.body['2015-09-23'].children[0].text.includes('Hillary Clinton')).to.equal(true);
      })
      .end(done);
  });

  // it('should not retrieve news tweets without search term in title or text', function() {});

});

