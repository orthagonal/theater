'use strict';
// const SceneSwitchingNode = require('./IntrasceneSwitcher.js');

// spawn all the video and effect nodes for this Scene:
class SceneNodes {
  constructor(videoContext, sceneDescription) {
  }

  // start playing the Scene at the beginning:
  play() {
    // ok not sure here
    console.log('SceneNodes.play');
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
