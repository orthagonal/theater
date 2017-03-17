'use strict';
const _ = require('lodash');
// const VideoChainer = require('./VideoChainer.js');
const VideoChainer = require('./VideoController.js');
const Graphics = require('./Graphics.js');

class CoreController {
  constructor(modulePath, $, width, height) {
    this.$ = $;
    this.videoCanvas = $('#videoCanvas')[0];
    this.videoCanvas.width = width;
    this.videoCanvas.height = height;
    this.module = require(modulePath).loadClientHandlers(this);
    this.graphics = new Graphics(this.module, this.videoCanvas, $);
    // graphics.addTextChain('the wolf has eaten the lamb', {x:320,y:240}, false);
    this.videoController = new VideoChainer(this.module, this.videoCanvas, this, {}, $);
    this.graphics.videoChainer = this.videoController;
    // graphics should be a shader node:
    // this.videoController.graphics = this.graphics;
    this.graphics.coreController = this;
    // audo controller should be it's own thing:
    // this.audioController = this.videoController.audioController;
    //todo: make module initialization nicer:
    this.module.init();
  }

  start(gameState) {
    // load the current game state as nodes:
    this.videoController.start(gameState);
  }
	// todo: nwjs probably can make this pipeline much simpler:
  // sendQuery(packet) {
  //   console.log('CoreController.sendQuery')
  //   packet.userId = 'mainUser';
  //   this.module.query(packet, this.processGameState.bind(this));
  // }
  //
  // processGameState(currentGameState) {
  //   console.log('callback CoreController.processGameState called withresult')
  //   console.log(currentGameState)
  //   console.log('CoreController.handleQuery callbaqck inside sendQuery')
  //   console.log(currentGameState)
  //   if (currentGameState.result && currentGameState.result.sound) {
  //     this.videoController.audioController.startEffect(currentGameState.result.sound);
  //   }
  //   if (currentGameState.msg === 'BranchToScene') {
  //     this.videoController.handleBranch(currentGameState.result);
  //   } else {
  //     this.videoController.processGameState(currentGameState);
  //   }
  // }

  kickstart(gameId, userId) {
		// get the global value for gameId
    // if (gameId === 'newGame') {
    this.module.startNewGame(userId);
    // this.module.startNewGame(userId, this.processGameState.bind(this));
    // } else {
    //   let gameId = '1';
    //   this.module.continueExistingGame(gameId, function(gameState) {
		// 		// req.sessionStore.userId = req.body.username;
		// 		// req.sessionStore.gameId = req.body.gameId;
    //     this.videoController.processGameState(gameState);
    //   });
    // }
  }

	// inventory stuff
  useInventoryItem(item) {
		// tell the item to go to the corner
    this.graphics.selectItem(item);
  }

  handleClick(x, y) {
		// first see if they clicked on a client-side object:
    const result = this.graphics.handleClick(x, y);
		//  check the canvas
    if (!result) {
      let selectedItem = undefined;
      if (this.graphics.selectedItem) {
        selectedItem = this.graphics.selectedItem.item.name;
      }
      return this.sendQuery({
        // todo: will need to update this?
        // filmName: this.videoController.getVideoName(),
        // frameCount: this.videoController.getFrameCount(),
        roomName: this.currentRoom,
        action: 'click',
        x,
        y,
        selectedItem
      });
    }
    if (result.exit) {
      this.hideInventory();
      this.graphics.unselectItem();
    }
		// result.use is the item:
    if (result.use) {
      this.hideInventory();
      this.useInventoryItem(result.use)
    }
    if (result.inventory) {
      alert('needs to send inventory item');
      //this.sendInventory({})
    } else if (result.thumbnail) {
      this.hideInventory();
      this.graphics.expandInventoryItem(result);
    } else if (result.inventoryButton) {
      this.activateInventory();
    } else if (result.text) {
      alert('returned a text result ');
      this.sendQuery({ query: result.text });
    }
  }

  // send request to server to refresh inventory
	// then show it
  activateInventory() {
    $.get('/inventory/', (inventory) => {
      if (inventory) {
        this.graphics.showInventory(inventory);
      }
    });
  }

  showInventory(inventory) {
    this.graphics.showInventory(inventory);
  }

  // get an invetory item or return 'false' if not in
  getInventoryItem(name) {
    // check game state
    return false;
  }
	// this.showInventory([{
	// 	img : '/images/girlwithdoll.jpg',
	// 	name : 'girlwithdoll'
	// }]);
  hideInventory() {
    this.graphics.hideInventory();
  }

  checkIn() {
    this.getGameState(() => _.delay(this.checkIn, tickRate));
  }
}
if (module) {
  module.exports = CoreController;
}
