/// why is this even here?

'use strict';
// const AudioController = require('./AudioController');
require('./lib/videocontext.js');
const MainSwitcher = require('./MainSwitcher');

class VideoController {
  constructor(videoContext, coreController, options, $) {
    this.coreController = coreController;
    this.videoContext = videoContext;
    this.currentSceneDescription = {};
    this.currentSceneVideo = {};
    this.mainSwitcher = new MainSwitcher(this.videoContext);
    this.currentSceneNodes = '';
  }

  // module will call this from init;
  start(gameState) {
  }
}

module.exports = VideoController;
