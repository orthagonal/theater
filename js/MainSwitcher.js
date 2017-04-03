'use strict';

class MainSwitcher {
  constructor(videoContext) {
    this.mainNode = videoContext.transition(videoContext.DEFINITIONS.CROSSFADE);
    this.videoContext = videoContext;
    this.mainNode.connect(this.videoContext.destination);
    this.currentNodes = undefined;
  }

  // plug a src scene switcher into this one:
  connect(intrasceneSwitcher) {
    console.log('MainSwitcher.connect')
    console.log(intrasceneSwitcher.transitionNode)
    console.log('main node was:')
    console.log(this.mainNode)
    intrasceneSwitcher.transitionNode.connect(this.mainNode);
  }

  // start a scene without hesitation:
  start(sceneNodes) {
    sceneNodes.sceneSwitchingNode.connect(this.mainNode);
    sceneNodes.play();
  }
  // transition to a scene:
  transitionToScene(sceneNodes, transitionType) {
    // attach the new nodes
    sceneNodes.sceneSwitchingNode.connect(this.mainNode);
    // transition to this.mainNode
    this.mainNode.transition(1.0, 1.1, 0.0, 1.0, 'mix');
    // remove the old ones
    this.currentNodes.sceneSwitchingNode.disconnect(this.mainNode);
    this.currentNodes = sceneNodes;
  }
}

module.exports = MainSwitcher;
