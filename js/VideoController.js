const EventEmitter = require('events');
const SwitcherShader = require('./SwitcherShader');

class VideoController extends EventEmitter {
  constructor(controller, gl) {
    super();
    this.controller = controller;
    this.dimensions = controller.dimensions;
    this.currentScene = false;
    this.currentVideo = false;
    this.lastVideo = false;
    this.nextVideo = false;
    this.videoFetcher = false;
    this.activeObject = false;
    this.currentVideoIndex = -1;

    this.switcher = new SwitcherShader(this, gl, controller.dimensions);
  }

  // CoreController uses this:
  setActiveObject(gameObject) {
    this.activeObject = gameObject;
    // now start the object playing:
    if (gameObject.onConnect) {
      gameObject.onConnect(this);
    }
  }

  // Active Object uses these:
  loadCurrentScene(sceneDescription) {
    this.currentScene = sceneDescription;
  }

  // just a function that picks out the next video to play
  // can be overloaded by the active object:
  getNextVideo() {
    if (this.activeObject.videoFetcher) {
      return this.activeObject.videoFetcher();
    }
    // otherwise do default 'sequential' behavior:
    // todo: add other basic behaviors
    this.currentVideoIndex++;
    if (this.currentVideoIndex >= this.sceneDescription.roots.length) {
      this.currentVideoIndex = 0;
    }
    const scene = this.sceneDescription.roots[this.currentVideoIndex];
    // todo: do i need to rewind the video to start here?
    return scene;
  }
}

module.exports = VideoController;
