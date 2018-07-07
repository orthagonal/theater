const EventEmitter = require('events');
const SwitcherShader = require('./SwitcherShader');

global.NO_EFFECT = 0.0;
global.MOUSE_FLARE_EFFECT = 1.0;
global.MOUSE_BW_EFFECT = 2.0;

class VideoController extends EventEmitter {
  constructor(controller, gl, theWindow) {
    super();
    this.sceneDescription = false;
    this.controller = controller;
    this.theWindow = theWindow;
    this.dimensions = controller.dimensions;
    this.currentVideo = false;
    this.lastVideo = false;
    this.nextVideo = false;
    this.videoFetcher = false;
    this.activeObject = false;
    this.switcher = new SwitcherShader(this, gl, controller.dimensions, controller.devMode);
  }

  // called when previous video is finished playing:
  previousEnd() {
    // delete this.currentVideo.onended;
    this.currentVideo = this.activeObject.getNextVideo();
    this.switcher.connectVideo(this.currentVideo.element);
    if (this.currentVideo.hasMask) {
      // play mask video for interface controller and as input to the switcher:
      this.switcher.connectMask(this.controller.interfaceController.connectMask(this.currentVideo.maskPath));
    }
    this.currentVideo.element.onended = this.previousEnd.bind(this);
    this.currentVideo.element.play();
  }

  branchTo(sourceVideo, destinationObject) {
    // when the video is done activate the new object:
    sourceVideo.element.onended = () => {
      destinationObject.activate(this);
      this.controller.branching = false;
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
      this.switcher.connectMask(this.controller.interfaceController.connectMask(this.currentVideo.maskPath));
    }
  }

  // get time remaining in current video:
  getRemainingTime() {
    const videoDuration = 3000.0;
    return videoDuration;
  }
}

module.exports = VideoController;
