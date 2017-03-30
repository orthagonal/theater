'use strict';
class IntersceneSwitcher {
  constructor(videoContext) {
    console.log('IntersceneSwitcher.constructor')
    console.log(videoContext)
    this.transitionNode = videoContext.transition(videoContext.DEFINITIONS.CROSSFADE);
    this.currentNodes = undefined;
  }
  // start a scene without hesitation:
  start(sceneNodes) {
    sceneNodes.sceneSwitchingNode.connect(this.transitionNode);
    this.transitionNode.connect(this.videoContext.destination);
    sceneNodes.play();
  }
  // transition to a scene:
  transitionToScene(sceneNodes, transitionType) {
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
