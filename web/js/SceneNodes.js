'use strict';

// spawn all the video and effect nodes for this Scene:
class SceneNodes {
  constructor(videoContext, sceneDescription, sceneNode) {
    this.sceneDescription = sceneDescription;
    // load video nodes:
    this.rootVideoNodes = [];
    this.loopVideoNodes = [];
    this.partialVideoNodes = {};
    this.branchVideoNodes = {};
    sceneDescription.roots.forEach((root) => {
      this.rootVideoNodes.push(this.videoContext.video(root.title));
    });
    sceneDescription.loops.forEach((loop) => {
      this.loopVideoNodes.push(this.videoContext.video(loop.title));
    });
    Object.keys(sceneDescription.branches).forEach((key) => {
      this.branchVideoNodes[key] = [];
      sceneDescription.branches[key].forEach((branch) => {
        this.branchVideoNodes[key].push(this.videoContext.video(branch.title));
      });
    });
    if (sceneDescription.partials) {
      sceneDescription.partials.forEach((partial) => {
        this.partialVideoNodes.push(this.videoContext.video(partial.title));
      });
    }
  }

  // connect everything to the scene node
  // connect everything to the destination node:
  connect() {
  }
}

module.exports = SceneNodes;
