'use strict';
const VideoController = require('./VideoController');
const AudioController = require('./AudioController');

const Module = require('../modules/IrisOne/js/the_repository_1.js');

class CoreController {
  constructor(finalDestinationCanvas, hitboxCanvas, modulePath, $, dimensions) {
    this.$ = $;
    this.dimensions = dimensions;
    this.currentSceneDescription = {};
    this.currentSceneVideo = {};

    this.hitboxCanvas = hitboxCanvas;
    this.finalDestinationCanvas = finalDestinationCanvas;

    this.gl = this.finalDestinationCanvas.getContext('webgl');

    this.audioController = new AudioController($);
    this.videoController = new VideoController(this, this.gl);

    // this loads any module:
    // const Module = require(modulePath);
    this.gameObjects = {};
    this.module = new Module(this);
    this.activeObject = null;
    this.gameState = {
      meta: {
        started: false
      }
    };
  }

  // modules will take over the video controller here
  kickstart(gameId, userId) {
    this.module.controller = this;
    this.module.startNewGame(userId);
  }

  loadGameObject(gameObject) {

  }
}
if (module) {
  module.exports = CoreController;
}
