'use strict';

class MainSwitcher {
  constructor(videoContext) {
    this.mainNode = videoContext.compositor(videoContext.DEFINITIONS.COMBINE);
    this.mainNode.name = 'MainSwitcher.mainNode';
    videoContext.destination.name = 'DestinationNode';
    this.mainNode.connect(videoContext.destination);
    this.videoContext = videoContext;
    this.currentNodes = undefined;
  }

  // plug a src scene switcher into this one:
  connect(intrasceneSwitcher) {
    intrasceneSwitcher.effectNode.connect(this.mainNode);
  }
}

module.exports = MainSwitcher;
