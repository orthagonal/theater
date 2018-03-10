const EventEmitter = require('events');
const SwitcherShader = require('./SwitcherShader');

class VideoController extends EventEmitter {
  constructor(controller, gl) {
    super();
    this.sceneDescription = false;
    this.controller = controller;
    this.dimensions = controller.dimensions;
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

  previousEnd() {
    // delete this.currentVideo.onended;
    this.currentVideo = this.getNextVideo();
    this.switcher.connectVideo(this.currentVideo.element);
    this.currentVideo.element.onended = this.previousEnd.bind(this);
    this.currentVideo.element.play();
  }

  // Active object calls this:
  startScene(scene) {
    // todo: might need to remove previous element.eventHandler
    this.sceneDescription = scene;
    this.currentVideo = this.getNextVideo();
    this.switcher.connectVideo(this.currentVideo.element);
    this.currentVideo.element.onended = this.previousEnd.bind(this);
    this.currentVideo.element.play();
  }

  // just a function that picks out the next video to play
  // can be overloaded by the active object:
  getNextVideo() {
    // todo: this should probably just always get from the active object:
    if (this.activeObject.videoFetcher) {
      return this.activeObject.videoFetcher();
    }
    // otherwise do default 'sequential' behavior:
    // todo: add other basic behaviors
    this.currentVideoIndex++;
    if (this.currentVideoIndex >= this.sceneDescription.roots.length) {
      this.currentVideoIndex = 0;
    }
    const video = this.sceneDescription.roots[this.currentVideoIndex];
    // todo: do i need to rewind the video to start here?
    return video;
  }
}

module.exports = VideoController;
