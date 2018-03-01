'use strict';
const AudioController = require('./AudioController');
const MainSwitcher = require('./MainSwitcher');
// iris-specific but useful for development:
const Module = require('../modules/IrisOne/js/the_repository_1.js');

class CoreController {
  constructor(videoContext, hitboxCanvas, modulePath, $) {
    this.$ = $;
    this.videoContext = videoContext;
    this.currentSceneDescription = {};
    this.currentSceneVideo = {};
    this.hitboxCanvas = hitboxCanvas;
    this.mainSwitcher = new MainSwitcher(this.videoContext);
    this.currentSceneNodes = '';
    // audo controller should be it's own thing:
    this.audioController = new AudioController($);
    // this loads any module:
    // const Module = require(modulePath);
    this.gameObjects = {};
    this.module = new Module(this);
    this.activeObject = null;
  }

  // modules will take over the video controller here
  kickstart(gameId, userId) {
    this.module.controller = this;
    this.module.startNewGame(userId);
  }
}
if (module) {
  module.exports = CoreController;
}
