'use strict';
// const GameObject = require('./GameObject.js');
const VideoController = require('./VideoController');
const AudioController = require('./AudioController');
const InterfaceController = require('./InterfaceController');

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
    this.interfaceController = new InterfaceController(this);
    // this.interfaceController = new InterfaceController(this, GameObject.videoDirectory);

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
    const destinationObject = this.gameObjects[destinationObjectName];
    this.videoController.branchTo(sourceVideo, destinationObject);
  }
}
if (module) {
  module.exports = CoreController;
}
