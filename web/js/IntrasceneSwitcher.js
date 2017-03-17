'use strict';
class IntrasceneSwitcher {
  constructor(videoContext, behavior) {
    this.transitionNode = videoContext.transition(videoContext.DEFINITIONS.CROSSFADE);
    this.currentNodes = undefined;
    this.behavior = behavior;
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
