'use strict';
const VideoChainer = require('./VideoController.js');
const AudioController = require('./AudioController');
const MainSwitcher = require('./MainSwitcher');

class CoreController {
  constructor(videoContext, modulePath, $) {
    this.$ = $;
    this.videoCanvas = $('#videoCanvas')[0];
    this.videoContext = videoContext;
    this.videoContext = videoContext;
    this.currentSceneDescription = {};
    this.currentSceneVideo = {};
    this.mainSwitcher = new MainSwitcher(this.videoContext);
    this.currentSceneNodes = '';
    // audo controller should be it's own thing:
    this.audioController = new AudioController($);
    //todo: make module initialization nicer:
    const Module = require(modulePath);
    this.module = new Module(this);
  }

  // modules will take over the video controller here
  kickstart(gameId, userId) {
    this.module.startNewGame(userId);
  }
}
if (module) {
  module.exports = CoreController;
}
