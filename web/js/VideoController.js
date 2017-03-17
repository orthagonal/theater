'use strict';
const AudioController = require('./AudioController');
const VideoContext = require('./lib/videocontext.js');
const SceneNodes = require('./lib/SceneNodes.js');
const IntersceneSwitcher = require('./IntersceneSwitcher');

class VideoController extends VideoContext {
  constructor(module, videoCanvas, coreController, options, $) {
    super(videoCanvas);
    this.coreController = coreController;
    this.currentSceneDescription = {};
    this.currentSceneVideo = {};
    this.sceneSwitchingNode = new IntersceneSwitcher(this);
    this.currentSceneNodes = '';
    // module.getFirstSceneNodes();
  }

  // module will call this from init;
  start(gameState) {
    console.log('videoController.start')
    console.log(gameState);
    // hydrate gamestate as a SceneNodes
    const newSceneNodes = new SceneNodes(this, gameState.scene);
    this.sceneSwitchingNode.start(newSceneNodes);
  }
}

module.exports = VideoController;
