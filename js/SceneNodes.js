'use strict';
const SceneSwitchingNode = require('./IntrasceneSwitcher');

// spawn all the video and effect nodes for this Scene:
class SceneNodes {
  constructor(videoContext, sceneDescription) {
    console.log('SceneNodes.constructor');
    this.videoContext = videoContext;
    this.sceneDescription = sceneDescription;
    // load video nodes:
    this.rootVideoNodes = [];
    this.loopVideoNodes = [];
    this.partialVideoNodes = {};
    this.branchVideoNodes = {};
    console.log('so scene description is')
    console.log(sceneDescription)
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
    this.sceneSwitchingNode = new SceneSwitchingNode(this.videoContext, sceneDescription.behavior);
  }

  // start playing the Scene at the beginning:
  play() {
    // ok not sure here
    console.log('SceneNodes.play');
  }

  // branch to a new scene:
  branchTo(branchVideoName, newSceneNodes, transitionType) {
    const branchVideo = this.branchVideoNodes[branchVideoName];
    // attach the new scene:
    this.videoContext.attachNewScene(newSceneNodes);
    // register the event so when it ends switch to the new Scene
    branchVideo.registerCallback('ended', () => {
      this.videoContext.switchTo(newSceneNodes);
    });
    // play the branch video and the rest is handled by the event handler:
    branchVideo.play();
  }
}

module.exports = SceneNodes;

// behavior nodes:
  // playthrough:
  // play root1 1 from 0 to length
  // play branch from 0 to length

  // repeat:
  // play root from 0 to length
  // play loop from 0 to length
  // (etc)

  // switch:
  // play root from 0 to n1
  // play loop from n1 to n2
  // play root from n2 to n3 (etc)

  // custom video control node:
  // plays whatever video
  // composes other video elements

// current scene's video nodes:
