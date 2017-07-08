'use strict';
const AudioController = require('./AudioController');
const MainSwitcher = require('./MainSwitcher');

class CoreController {
  constructor(videoContext, modulePath, $) {
    this.$ = $;
    this.videoContext = videoContext;
    this.currentSceneDescription = {};
    this.currentSceneVideo = {};
    this.mainSwitcher = new MainSwitcher(this.videoContext);
    this.currentSceneNodes = '';
    // audo controller should be it's own thing:
    this.audioController = new AudioController($);
    // todo: make module initialization nicer:
    const Module = require(modulePath);
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
