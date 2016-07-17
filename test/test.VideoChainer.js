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
const _ = require('underscore');
global._ = _;
let Server;
let startCalled = false;
let endCalled = false;
// will be our jquery object:
let $;

const options = {
  height: 500,
  width: 500
};

const testJunction = {
  junctionName: "testJunction",
	core :{
		roots : [{title:"./web/movies/background_led.MOV",
				hitboxes: ['lookLeft', 'lookRight']}],
		loops : [{title:"./web/movies/doll_sit.mp4",
				hitboxes: ['lookLeft', 'lookRight', 'lookLegs']}]
	},
	branches : {
		LeftAndRight : [{title:"./web/movies/background_led.MOV"}],
	},
	behavior :{
		behavior_type : "playthrough",
	}
};

const secondJunction = {
  junctionName: "secondJunction",
  core :{
    roots : [{title:"movies/small.webm",
        hitboxes: ['ceiling']}],
    loops : [{title:"movies/prologue/branch.webm",
        hitboxes: ['ceiling']}],
  },
  branches : {
    LeftAndRight : [{title:"movies/background_led.MOV"}],
  },
  behavior :{
    behavior_type : "repeat",
  }
};

describe('VideoChainer object', function() {
  beforeEach((done) => {
    global.ClientHandlers = {
      RootBehaviors : {},
      LoopBehaviors : {}
    };
    done();
  });
  this.timeout(15000);
  var jsdom = require('jsdom').jsdom;
  it('can be initialized ', (done) => {
    const window = jsdom().defaultView;
    const canvasMockify = require('canvas-mock');
    const fakeCanvas = window.document.createElement('canvas');
    canvasMockify(fakeCanvas);
    const fakeCore = {};
    let videoChainer = new VideoChainer(fakeCanvas, fakeCore, options);
    chai.expect(videoChainer).to.be.a('object');
    chai.expect(videoChainer.audioController).to.be.a('object');
    chai.expect(videoChainer.videoContext).to.be.a('object');
    chai.expect(videoChainer.width).to.equal(options.width);
    chai.expect(videoChainer.width).to.equal(options.width);
    done();
  });

  it('can load videos for a repeat junction ', (done) => {
    const window = jsdom().defaultView;
    const canvasMockify = require('canvas-mock');
    const fakeCanvas = window.document.createElement('canvas');
    canvasMockify(fakeCanvas);
    const fakeCore = {};
    let videoChainer = new VideoChainer(fakeCanvas, fakeCore, options);
    let allDone = false;
    let graphicsLoadJunction = false;
    let elementEnd = false;
    let drawCalled = false;
    videoChainer.graphics = {
      loadJunction: function(junction) {
        graphicsLoadJunction = true;
        chai.expect(junction.junctionName).to.equal('testJunction');
      },
      draw: function() {
        chai.expect(graphicsLoadJunction).to.equal(true);
        drawCalled = true;
      }
    };
    videoChainer.handleNewJunction({
      behavior: testJunction.behavior,
      junction: testJunction.core,
      junctionName: testJunction.junctionName
    });
    chai.expect(videoChainer.currentJunction).to.be.a('object');
    chai.expect(videoChainer.behavior.behavior_type).to.equal('playthrough');
    chai.expect(videoChainer.rootVideoElements.length).to.equal(1);
    chai.expect(videoChainer.loopVideoElements.length).to.equal(1);
    _.delay( () => {
      chai.expect(drawCalled).to.equal(true);
      done();
    }, 2000);

  });

  it('can transition to a new junction ', (done) => {
    const fakeCore = {};
    const window = jsdom().defaultView;
    const canvasMockify = require('canvas-mock');
    const fakeCanvas = window.document.createElement('canvas');
    canvasMockify(fakeCanvas);
    let videoChainer = new VideoChainer(fakeCanvas, fakeCore, options);
    videoChainer.graphics = {
      loadJunction: function(junction) {
      },
      draw: function() {
        done();
      }
    };
    let drawCalled = false;
    let loadGraphicsCalled = false;
    videoChainer.handleNewJunction({
      behavior: testJunction.behavior,
      junction: testJunction.core,
      junctionName: testJunction.junctionName
    });
    _.delay(() => {
      videoChainer.graphics = {
        // load a new junction next
        loadJunction: function(junction) {
          chai.expect(videoChainer.behavior.behavior_type).to.equal('repeat');
          chai.expect(videoChainer.rootVideoElements.length).to.equal(1);
          chai.expect(videoChainer.rootVideoElements[0].url).to.equal('small.webm');
          chai.expect(videoChainer.loopVideoElements.length).to.equal(1);
          loadGraphicsCalled = true;
        },
        draw: function() {
          drawCalled = true;
        }
      };
      videoChainer.handleBranch(secondJunction);
    }, 2000);
    _.delay( () => {
      chai.expect(drawCalled).to.equal(true);
      chai.expect(loadGraphicsCalled).to.equal(true);
      done();
    }, 4000);
  });
});
