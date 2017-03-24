'use strict';
class IntrasceneSwitcher {
  constructor(videoContext, behavior) {
    this.transitionNode = videoContext.compositing(videoContext.DEFINITIONS.CROSSFADE);
    this.currentNodes = undefined;
    this.behavior = behavior;
  }

  // just switch to a video
  playVideo() {

  }

  startBehavior(gameState) {
    // start the behavior whatever it is
  }
}

class PlaythroughSwitcher extends IntrasceneSwitcher {
  startBehavior(gameState) {
  }
}

class RepeatSwitcher extends IntrasceneSwitcher {
  startBehavior(gameState) {
  }
}

module.exports = PlaythroughSwitcher;
module.exports = RepeatSwitcher;
