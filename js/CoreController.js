'use strict';
const VideoController = require('./VideoController');
const AudioController = require('./AudioController');
const InterfaceController = require('./InterfaceController');

const Module = require('../modules/IrisOne/js/the_repository_1.js');

class CoreController {
  constructor(options) {
    this.theWindow = options.theWindow;
    this.$ = options.$;
    this.devMode = options.devMode;
    this.dimensions = options.dimensions;
    this.currentSceneDescription = {};
    this.currentSceneVideo = {};

    this.hitboxCanvas = options.hitboxCanvas;
    this.finalDestinationCanvas = options.finalDestinationCanvas;

    this.gl = this.finalDestinationCanvas.getContext('webgl');

    this.audioController = new AudioController(options.$);
    this.videoController = new VideoController(this, this.gl, options.theWindow);
    this.interfaceController = new InterfaceController(this);

    // this loads any module:
    // const Module = require(modulePath);
    this.gameObjects = {};
    this.module = new Module(this);
    this.activeObject = null;
    this.branching = false;
    this.gameState = {
      meta: {
        started: false
      }
    };
  }

  goUp(val) {
    this.videoController.goUp(val);
  }

  // modules will take over the video controller here
  kickstart(gameId, userId) {
    this.module.controller = this;
    this.module.startNewGame(userId);
  }

  loadGameObject(gameObject) {
    // deactivate old object:
    if (this.activeObject) {
      this.activeObject.deactivate();
    }
    this.activeObject = gameObject;
    gameObject.activate(this.videoController);
    // todo: this.audiController.setActiveObject(gameObject);
  }

  // todo: this will eventually need to dynamically load
  branchTo(sourceVideo, destinationObjectName, transitionType) {
    this.branching = true;
    const destinationObject = this.gameObjects[destinationObjectName];
    this.videoController.branchTo(sourceVideo, destinationObject, transitionType);
  }

  deactivateEffect() {
    this.videoController.switcher.deactivateEffect();
  }

  activateEffect(info) {
    if (info.duration === 'remainingTime') {
      // need to play remaining time plus some
      // play the effect until the end of the video then transfer to next video
      info.duration = 2000.0 + this.videoController.getRemainingTime();
    }
    if (info.when === 'videoEnd') {
      info.when = this.videoController.getRemainingTime();
      console.log(info.when);
    }
    if (info.when && info.callback) {
      setTimeout(info.callback.bind(this), info.when);
    }
    this.videoController.switcher.activateEffect(info);
  }

  toggleDevMode() {
    this.devMode = this.devMode === 1.0 ? 0.0 : 1.0;
    this.videoController.switcher.setShaderVariable('u_debugMode', this.devMode);
  }

  mouseMiss(mouseEvent, timestamp) {
    // todo: play a sound
    this.videoController.mouseMiss(mouseEvent, timestamp);
  }
}
if (module) {
  module.exports = CoreController;
}
