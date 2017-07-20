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

  // plug a src node from the main output:
  connect(node) {
    node.connect(this.mainNode);
  }

  // remove a src scene
  // disconnect(node) {
  //   const connections = this.videoContext._renderGraph.connections;
  //   for (let i = 0; i < connections.length; i++) {
  //     const sourceNode = connections[i].source;
  //     console.log(sourceNode)
  //     if (node === sourceNode) {
  //       console.log('disconnecting')
  //       console.log(sourceNode)
  //       node.disconnect(this.mainNode);
  //     }
  //   }
  // }
}

module.exports = MainSwitcher;
