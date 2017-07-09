'use strict';

class MainSwitcher {
  constructor(videoContext) {
    this.mainNode = videoContext.transition(videoContext.DEFINITIONS.CROSSFADE);
    this.mainNode.name = 'MainSwitcher.mainNode';
    videoContext.destination.name = "DestinationNode";
    // this.mainNode.transition(2,4,0.0,1.0, "mix");
    this.mainNode.connect(videoContext.destination);
    this.videoContext = videoContext;
    this.currentNodes = undefined;
  }

  // plug a src scene switcher into this one:
  connect(intrasceneSwitcher) {
    intrasceneSwitcher.effectNode.connect(this.mainNode);
  }

  // transition to a scene:
  transitionToScene(sceneNodes, transitionType) {
    console.log('transitionToScene is called');
    // attach the new nodes
    // sceneNodes.sceneSwitchingNode.connect(this.mainNode);
    // transition to this.mainNode
    this.mainNode.transition(1.0, 1.1, 0.0, 1.0, 'mix');
    // remove the old ones
    // this.currentNodes.sceneSwitchingNode.disconnect(this.mainNode);
    // this.currentNodes = sceneNodes;
  }
}

module.exports = MainSwitcher;
