'use strict';
const chai = require('chai');
const fs = require('fs');
const jsdom = require('mocha-jsdom');
require('mocha-sinon');
const async = require('async');
global.async = async;
const FilmClip = require('../web/js/FilmClip.js');
const AudioController = require('../web/js/AudioController.js');
const VideoChainer = require('../web/js/VideoChainer.js');

let Server;
let startCalled = false;
let endCalled = false;
// will be our jquery object:
let $;

const options = {
  height: 500,
  width: 500
};

// some mock data:
const clipData = {
  title: 'c:/theater/web/movies/doll_sit.webm'
};

describe('FilmClip object', function() {
  // set everything back to start:
  beforeEach((done) => {
    done();
  });
  this.timeout(10000);
  jsdom();
  it('can be initialized ', (done) => {
    chai.expect(FilmClip).to.be.a('function');
    $ = require('jquery')
    global.$ = $;
    const filmClip = new FilmClip(clipData,  () => {
    },
    () => {
    });
    chai.expect(filmClip.videoElement.play).to.be.a('function');
    chai.expect(filmClip.videoElement.onended).to.be.a('function');
    chai.expect(filmClip.clear).to.be.a('function');
    chai.expect(filmClip.url).to.equal(clipData.title);
    chai.expect(filmClip.videoElement.src).to.equal(clipData.title);
    done();
  });

  it('will call begin when it can play', (done) => {
    $ = require('jquery')
    global.$ = $;
    let startCalled = false;
    const filmClip = new FilmClip(clipData,  () => {
      startCalled = true;
      console.log(filmClip.videoElement.duration)
      done();
    },
    () => {
    });
    filmClip.start();
  });
  // todo: not sure how to test this in node:
  // it('will call end when done playing', (done) => {
  //   $ = require('jquery')
  //   global.$ = $;
  //   let startCalled = false;
  //   const filmClip = new FilmClip(clipData,  () => {
  //     startCalled = true;
  //     console.log(filmClip.videoElement.duration)
  //   },
  //   () => {
  //     done();
  //   });
  //   filmClip.start();
  // });
});
