var VideoChainer = require("./VideoChainer.js");
var Graphics = require("./Graphics.js");
var Server = require('../../lib/nwserver.js');

//                  Server Interface                       //
function CoreController($){
	videoCanvas = $('#videoCanvas')[0];
	this.graphics = new Graphics(videoCanvas, $);
	// graphics.addTextChain("the wolf has eaten the lamb", {x:320,y:240}, false);
	this.videoController = new VideoChainer( videoCanvas, this, {}, $);
	this.graphics.videoChainer = this.videoController
	this.videoController.graphics = this.graphics
	this.graphics.coreController = this
	self = this;

	// try to get the current frame of the current video:
	this.getFrameCount = function(){
		return self.videoController.getFrameCount();
    //return (vid.currentTime * 24).toPrecision(6);
  }
  // get the file name of the current video:
  this.getVideoName = function(){
  	return self.videoController.getVideoName();
  }
	// put graphics/video here:
	this.sendQuery = function(packet){
		// query has to return to go to next junction:
		packet.userId = 'mainUser';
		Server.query(packet, self.handleQuery);
	}
	this.handleQuery = function(data){
		console.log('CoreController.handleQuery returns, data is:')
		console.log(data);
		if (data.result && data.result.sound){
			self.videoController.audioController.startEffect(data.result.sound);
		}
		if (data.msg === 'BranchToJunction'){
			self.videoController.handleBranch(data.result);
		}
	};
	this.kickstart = function(){
		// get the global value for GAMEID
		GAMEID = 'newGame';
		var userId = 'mainUser';
		if (GAMEID=='newGame'){
			Server.startNewGame( userId, function(runningGameState){
				self.videoController.handleNewJunction(runningGameState);
			});
		}
		else{
			var gameId = '1';
			Server.continueExistingGame(gameId, function(gameState){
				// req.sessionStore.userId = req.body.username;
				// req.sessionStore.gameId = req.body.gameId;
				self.videoController.handleNewJunction(gameState);
			});
		}
	};

	// inventory stuff
	this.useInventoryItem = function(item){
		// tell the item to go to the corner
		self.graphics.selectItem(item);
	}
	this.handleClick = function(x,y){
		// first see if they clicked on a client-side object:
		var result = self.graphics.handleClick(x,y)
		//  check the canvas
		if (!result) {
			var selectedItem = undefined;
			if (self.graphics.selectedItem)
				selectedItem = self.graphics.selectedItem.item.name;
			return this.sendQuery({
				filmName : self.videoController.getVideoName(),
				frameCount: self.videoController.getFrameCount(),
				junctionName: self.currentJunction,
				action: 'click',
				x:x,
				y:y,
				selectedItem : selectedItem
			});
		}
		if (result.exit){
			self.hideInventory();
			self.graphics.unselectItem();
		}
		// result.use is the item:
		if (result.use){
			self.hideInventory();
			self.useInventoryItem(result.use)
		}
		if (result.inventory){
			alert("needs to send inventory item");
			//this.sendInventory({})
		}
		else if (result.thumbnail){
			this.hideInventory();
			this.graphics.expandInventoryItem(result);
		}
		else if (result.inventoryButton){
			this.activateInventory()
		}
		else if (result.text){
			alert("returned a text result ")
			this.sendQuery({query:text})
		}
	}
	// send request to server to refresh inventory
	// then show it
	this.activateInventory = function(){
		$.get('/inventory/', function (inventory){
			if (inventory)
				self.graphics.showInventory(inventory);
		})
	}

	this.showInventory = function(inventory){
		this.graphics.showInventory(inventory);
	}

	// this.showInventory([{
	// 	img : "/images/girlwithdoll.jpg",
	// 	name : "girlwithdoll"
	// }]);
	this.hideInventory = function(){
		this.graphics.hideInventory();
	}
	this.kickstart();
	this.checkIn = function(){
		getGameState(function(gameState){
			return _.delay(self.checkIn, tickRate);
			 // check in every minute
			// res.json(gameState);
		});
	}
}
if (module) {
	module.exports = CoreController;
}
