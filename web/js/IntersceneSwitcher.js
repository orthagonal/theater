'use strict';
class IntersceneSwitcher {
  constructor(videoContext) {
    this.transitionNode = videoContext.transition(videoContext.DEFINITIONS.CROSSFADE);
    this.currentNodes = undefined;
  }

  transitionToScene(sceneNodes) {
    // attach the new nodes
    sceneNodes.sceneSwitchingNode.connect(this.transitionNode);
    // transition to this.transitionNode
    this.transitionNode.transition(1.0, 1.1, 0.0, 1.0, 'mix');
    // remove the old ones
    this.currentNodes.sceneSwitchingNode.disconnect(this.transitionNode);
    this.currentNodes = sceneNodes;
  }
}

module.exports = IntersceneSwitcher;
