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
    this.switcher = new SwitcherShader(this, gl, controller.dimensions);
  }

  // called when previous video is finished playing:
  previousEnd() {
    // delete this.currentVideo.onended;
    this.currentVideo = this.activeObject.getNextVideo();
    this.switcher.connectVideo(this.currentVideo.element);
    if (this.currentVideo.hasMask) {
      this.controller.interfaceController.connectMask(this.currentVideo.maskPath);
    }
    this.currentVideo.element.onended = this.previousEnd.bind(this);
    this.currentVideo.element.play();
  }

  branchTo(sourceVideo, destinationObject) {
    // when the video is done activate the new object:
    sourceVideo.element.onended = () => {
      destinationObject.activate(this);
    };
    // play source video
    if (this.currentVideo) {
      this.currentVideo.element.onended = undefined;
    }
    this.currentVideo = sourceVideo;
    this.switcher.connectVideo(this.currentVideo.element);
    this.currentVideo.element.play();
  }

  // Active object calls this:
  startScene(scene) {
    if (this.currentVideo) {
      this.currentVideo.element.onended = undefined;
    }
    // todo: might need to remove previous element.eventHandler
    this.sceneDescription = scene;
    this.currentVideo = this.activeObject.getNextVideo();
    this.switcher.connectVideo(this.currentVideo.element);
    this.currentVideo.element.onended = this.previousEnd.bind(this);
    this.currentVideo.element.play();
    if (this.currentVideo.hasMask) {
      this.controller.interfaceController.connectMask(this.currentVideo.maskPath);
    }
  }

  // just a function that picks out the next video to play
  // can be overloaded by the active object:
}

module.exports = VideoController;
