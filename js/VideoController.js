const EventEmitter = require('events');
const SwitcherShader = require('./SwitcherShader');

global.NO_EFFECT = 0.0; // just show the video!
global.MOUSE_FLARE_EFFECT = 1.0; // lens flare at the mouse point
global.MOUSE_BW_EFFECT = 2.0; // a melty hole at the mouse point
global.TEXT_MELT_EFFECT = 3.0; // show the text as melty

class VideoController extends EventEmitter {
  constructor(controller, theWindow) {
    super();
    this.sceneDescription = false;
    this.controller = controller;
    this.theWindow = theWindow;
    this.dimensions = controller.dimensions;
    this.currentVideo = false; // the main video
    this.backgroundVideo = false; // the secondary video
    this.loopVideo = false; // the loop video
    this.lastVideo = false;
    this.nextVideo = false;
    this.videoFetcher = false;
    this.activeObject = false;
    this.switcher = new SwitcherShader(this, controller.dimensions, controller.devMode);
  }

  noShow(val) {
    this.switcher.noShow = val;
  }

  goUp(val) {
    this.switcher.goUp = val;
  }

  // in normal mode we play an entire video clip from start to finish
  // and call the current active game object to get the next video
  // and play it immediately with no break:
  previousEnd() {
    if (this.branching) {
      return this.branchEnd();
    }
    this.currentVideo.element.pause();
    // todo:
    this.currentVideo = this.nextVideo;
    this.switcher.connectVideo(this.currentVideo.element);
    this.currentVideo.element.onended = this.previousEnd.bind(this);
    this.currentVideo.element.onplaying = () => {
      // console.log(`onplaying took ${new Date() - t1}`);
      this.switcher.mainVideoReady = true;
    };
    this.currentVideo.element.currentTime = 0;
    this.currentVideo.element.play();
    this.nextVideo = this.activeObject.getNextVideo();
    if (this.currentVideo.maskPath) {
      // play mask video for interface controller and as input to the switcher:
      this.switcher.connectMask(this.controller.interfaceController.connectMask(this.currentVideo.maskPath));
    } else {
      this.switcher.disconnectMask();
    }
  }

  // when the branch to the new game object ends this will transition control to the new object:
  branchEnd() {
    // insert the branch
    this.currentVideo = this.branching.sourceVideo;
    this.switcher.connectVideo(this.currentVideo.element, true);
    const wrapper = () => {
      this.branching.destinationObject.activate(this);
      this.branching = false;
      this.previousEnd();
    };
    this.currentVideo.element.onended = wrapper.bind(this);
    this.currentVideo.element.play();
  }

  // call to branch control to a new game object:
  branchTo(sourceVideo, destinationObject, type) {
    // make sure mask is disco
    this.switcher.disconnectMask();
    // play source video
    // todo: this needs work i think?
    if (type === 'cut') {
      // when the video is done activate the new object:
      sourceVideo.element.onended = () => {
        destinationObject.activate(this);
        this.controller.branching = false;
      };
      if (this.currentVideo) {
        this.currentVideo.element.onended = undefined;
      }
      this.currentVideo = sourceVideo;
      this.switcher.connectVideo(this.currentVideo.element, false);
      this.currentVideo.element.play();
      return;
    }
    if (type === 'transition') {
      this.branching = { sourceVideo, destinationObject };
      // unset current handler:
      this.currentVideo.element.onended = undefined;
      this.currentVideo.element.onended = this.branchEnd.bind(this);
    }
  }

  // in syncSwitch mode we cut to a new video at random intervals
  // or any time the current video ends:
  previousEndSyncSwitch() {
    const temp = this.backgroundVideo;
    this.backgroundVideo = this.currentVideo;
    this.currentVideo = temp;
    this.switcher.connectVideo(this.currentVideo.element);
    this.currentVideo.muted = 'true';
    this.currentVideo.element.play();
    this.backgroundVideo.element.play();
    // todo: make sure this still works:
    // if (this.currentVideo.maskPath) {
    //   this.switcher.connectMask(this.controller.interfaceController.connectMask(this.currentVideo.maskPath));
    // }
    setTimeout(() => {
      this.previousEndSyncSwitch.bind(this)();
    }, 3000);//Math.max(this.sceneDescription.behavior.minCutLength, Math.floor(Math.random() * Math.floor(scene.behavior.maxCutLength))));
  }

  // called by object to initiate syncswitch
  startSyncSwitch(scene) {
    // remove previous element.eventHandler
    if (this.currentVideo) {
      this.currentVideo.element.onended = undefined;
    }
    if (this.backgroundVideo) {
      this.backgroundVideo.element.onended = undefined;
    }
    this.sceneDescription = scene;
    // start first root and first loop
    this.currentVideo = scene.roots[0];
    this.backgroundVideo = scene.loops[0];
    this.switcher.connectVideo(this.currentVideo.element);
    // this.currentVideo.element.onended = this.previousEnd.bind(this);
    this.currentVideo.element.play();
    this.backgroundVideo.element.play();
    // set a timeout to switch to the next one of random length
    // between the min and max:
    setTimeout(() => {
      this.previousEndSyncSwitch.bind(this)();
    }, 2000);// Math.max(scene.behavior.minCutLength, Math.floor(Math.random() * Math.floor(scene.behavior.maxCutLength))));
    if (this.currentVideo.maskPath) {
      this.switcher.connectMask(this.controller.interfaceController.connectMask(this.currentVideo.maskPath));
    }
  }

  // Active object will call this:
  startScene(scene) {
    if (scene.behavior.behavior_type === 'syncSwitch') {
      return this.startSyncSwitch(scene);
    }
    // remove previous element.eventHandler
    if (this.currentVideo) {
      this.currentVideo.element.onended = undefined;
    }
    this.sceneDescription = scene;
    this.currentVideo = this.activeObject.getNextVideo();
    this.nextVideo = this.activeObject.getNextVideo();
    this.nextVideo.element.load();
    this.switcher.connectVideo(this.currentVideo.element, true);
    this.currentVideo.element.onended = this.previousEnd.bind(this);
    this.currentVideo.element.oncanplay = () => {
      this.currentVideo.element.play();
    };
    this.currentVideo.element.load();
    if (this.currentVideo.maskPath) {
      this.switcher.connectMask(this.controller.interfaceController.connectMask(this.currentVideo.maskPath));
    }
  }

  // get time remaining in current video:
  getRemainingTime() {
    return this.currentVideo.element.duration - this.currentVideo.element.currentTime;
  }

  showPartial(partial, index, isTransition) {
    partial.started = false;
    this.switcher.allStarting = true;
    this.switcher.connectPartial.bind(this.switcher)(partial, index, isTransition);
  }
}

module.exports = VideoController;
