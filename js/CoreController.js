'use strict';
const VideoChainer = require('./VideoController.js');
const AudioController = require('./AudioController');

class CoreController {
  constructor(videoContext, modulePath, $, width, height) {
    this.$ = $;
    this.videoCanvas = $('#videoCanvas')[0];
    this.videoContext = videoContext;
    this.videoCanvas.width = width;
    this.videoCanvas.height = height;
    // graphics.addTextChain('the wolf has eaten the lamb', {x:320,y:240}, false);
    this.videoController = new VideoChainer(videoContext, this.videoCanvas, this, {}, $);
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
