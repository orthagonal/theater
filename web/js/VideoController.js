const AudioController = require('./AudioController');
const VideoContext = require('./lib/videocontext.js');

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
class SceneVideo {
  constructor(videoContext, sceneDescription, sceneNode) {
    this.sceneDescription = sceneDescription;
    // load video nodes:
    this.rootVideoNodes = [];
    this.loopVideoNodes = [];
    this.partialVideoNodes = {};
    this.branchVideoNodes = {};
    sceneDescription.roots.forEach((root) => {
      this.rootVideoNodes.push(this.videoContext.video(root.title));
    });
    sceneDescription.loops.forEach((loop) => {
      this.loopVideoNodes.push(this.videoContext.video(loop.title));
    });
    Object.keys(sceneDescription.branches).forEach((key) => {
      this.branchVideoNodes[key] = [];
      sceneDescription.branches[key].forEach((branch) => {
        this.branchVideoNodes[key].push(this.videoContext.video(branch.title));
      });
    });
    if (sceneDescription.partials) {
      sceneDescription.partials.forEach((partial) => {
        this.partialVideoNodes.push(this.videoContext.video(partial.title));
      });
    }
  }
  // connect everything to the scene node
  // connect everything to the destination node:
  activate() {

  }
}

class VideoController {
  constructor(module, videoCanvas, coreController, options, $){
    this.coreController = coreController;
    this.videoCanvas = videoCanvas;
    // the video context object:
    this.videoContext = new VideoContext(videoCanvas);
    this.audioController = new AudioController($);
    this.currentSceneDescription = {};
    this.currentSceneVideo = {};
    this.sceneLoading = false;
    this.sceneStarted = false;
  }

  loadScene(scene, allDone) {
    this.currentSceneDescription = scene;
    // const sceneVideo = new SceneVideo(this.videoContext, scene);
    this.sceneLoading = true;
    this.sceneStarted = false;
  }

  switchToVideo() {
  }

  branchNow(bracket) {
  }
}

module.exports = VideoController;
