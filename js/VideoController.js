'use strict';
// const AudioController = require('./AudioController');
require('./lib/videocontext.js');
const SceneNodes = require('./SceneNodes.js');
const IntersceneSwitcher = require('./IntersceneSwitcher');

class VideoController {
  constructor(videoContext, coreController, options, $) {
    this.coreController = coreController;
    this.videoContext = videoContext;
    this.currentSceneDescription = {};
    this.currentSceneVideo = {};
    this.sceneSwitchingNode = new IntersceneSwitcher(this.videoContext);
    console.log('video controller connecting to destination')
    this.sceneSwitchingNode.connect(videoContext.destination);
    console.log('video controller connected to destination')
    this.currentSceneNodes = '';
  }

  // module will call this from init;
  start(gameState) {
    console.log('videoController.start, gamestate:')
    console.log(gameState);
    // hydrate gamestate as a SceneNodes
    const newSceneNodes = new SceneNodes(this.videoContext, gameState.scene);
    this.sceneSwitchingNode.start(newSceneNodes);
  }
}

module.exports = VideoController;
