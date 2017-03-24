'use strict';
// const AudioController = require('./AudioController');
// const VideoContext = require('./lib/videocontext.js');
const SceneNodes = require('./SceneNodes.js');
const IntersceneSwitcher = require('./IntersceneSwitcher');

class VideoController {
  constructor(module, videoCanvas, coreController, options, $) {
    console.log('video controller initing')
    this.videoContext = VideoContext(videoCanvas);
    console.log('video controller inited')
    this.coreController = coreController;
    this.currentSceneDescription = {};
    this.currentSceneVideo = {};
    this.sceneSwitchingNode = new IntersceneSwitcher(this.videoContext);
    console.log('switching node inited')
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
