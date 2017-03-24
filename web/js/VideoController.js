'use strict';
// const AudioController = require('./AudioController');
const VideoContext = require('./lib/videocontext.js');
const SceneNodes = require('./SceneNodes.js');
const IntersceneSwitcher = require('./IntersceneSwitcher');

class VideoController extends VideoContext {
  constructor(module, videoCanvas, coreController, options, $) {
    console.log('video controller initing')
    super(videoCanvas);
    console.log('video controller inited')
    this.coreController = coreController;
    this.currentSceneDescription = {};
    this.currentSceneVideo = {};
    this.sceneSwitchingNode = new IntersceneSwitcher(this);
    console.log('switching node inited')
    this.currentSceneNodes = '';
  }

  // module will call this from init;
  start(gameState) {
    console.log('videoController.start, gamestate:')
    console.log(gameState);
    // hydrate gamestate as a SceneNodes
    const newSceneNodes = new SceneNodes(this, gameState.scene);
    this.sceneSwitchingNode.start(newSceneNodes);
  }
}

module.exports = VideoController;
