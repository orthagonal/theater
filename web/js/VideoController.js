const AudioController = require('./AudioController');
const VideoContext = require('./lib/videocontext.js');

// scene video graph:
// inventory shader effect node
// (all the Scene videos and scene effects) -> Scene Behavior Node -> InterScene Switching -> Compositing Node -> destination
                                                                                            // Inventory Shader ->
// behavior nodes:
  // playthrough:
  // play root1 1 from 0 to length
  // play branch from 0 to length

  // repeat:
  // play root from 0 to length
  // play loop from 0 to length
  // (etc)

  // switch:
  // play root from 0 to n1
  // play loop from n1 to n2
  // play root from n2 to n3 (etc)

  // custom video control node:
  // plays whatever video
  // composes other video elements

// current scene's video nodes:

class VideoController extends VideoContext {
  constructor(module, videoCanvas, coreController, options, $){
    super(videoCanvas);
    this.coreController = coreController;
    this.videoCanvas = videoCanvas;
    // the video context object:
    this.audioController = new AudioController($);
    this.currentSceneDescription = {};
    this.currentSceneVideo = {};
  }

  handleBranch(currentGameStateResult) {
    // attach all the input nodes
    // notify InterScene Switcher
  }
  // when we get a new scene:
  processGameState(currentGameState) {
    // spawn the scene's nodes:
    // const newSceneNodes = new SceneNodes(currentGameState);
    // attach it to the crossfader
    // notify the crossfader
    // unattach the old ones after the crossfader switches:
  }

  branchNow(destinationSceneName, modifiers) {
  }
  loadScene(scene, allDone) {
    this.currentSceneDescription = scene;
    // const sceneVideo = new SceneVideo(this.videoContext, scene);
    this.sceneLoading = true;
    this.sceneStarted = false;
  }
  switchToVideo() {
  }
}

module.exports = VideoController;
