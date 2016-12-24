var VideoChainer = require("./VideoChainer.js");
var Graphics = require("./Graphics.js");
var Server = require('../../lib/nwserver.js');

//                  Server Interface                       //
class CoreController {
	constructor(modulePath, $, width, height) {
		this.$ = $;
		this.videoCanvas = $('#videoCanvas')[0];
    this.videoCanvas.width = width;
    this.videoCanvas.height = height;
		this.module = require(modulePath).loadClientHandlers(this);
		this.graphics = new Graphics(this.module, this.videoCanvas, $);
		// graphics.addTextChain("the wolf has eaten the lamb", {x:320,y:240}, false);
		this.videoController = new VideoChainer(this.module, this.videoCanvas, this, {}, $, width, height);
		this.graphics.videoChainer = this.videoController;
		this.videoController.graphics = this.graphics;
		this.graphics.coreController = this;
		this.module.videoController = this.videoController;
		this.module.audioController = this.videoController.audioController;
		this.module.graphics = this.graphics;
		//todo: make module initialization nicer:
		this.module.init(this.videoController);
	}

	// try to get the current frame of the current video:
	getFrameCount(){
		return this.videoController.getFrameCount();
    //return (vid.currentTime * 24).toPrecision(6);
  }
  // get the file name of the current video:
  getVideoName(){
		console.log('+')
		console.log('+')
		console.log('+')
		console.log(this)
  	return this.videoController.getVideoName();
  }
	// put graphics/video here:
	sendQuery(packet){
		// query has to return to go to next room:
		packet.userId = 'mainUser';
		const handleQuery = (data) => {
			if (data.result && data.result.sound){
				this.videoController.audioController.startEffect(data.result.sound);
			}
			if (data.msg === 'BranchToRoom'){
				this.videoController.handleBranch(data.result);
			}
		};
		Server.query(packet, handleQuery);
	}
	kickstart(gameId, userId) {
		// get the global value for gameId
		if (gameId === 'newGame'){
			Server.startNewGame( userId, (runningGameState) => {
				this.videoController.handleNewRoom(runningGameState);
			});
		}
		else{
			var gameId = '1';
			Server.continueExistingGame(gameId, function(gameState){
				// req.sessionStore.userId = req.body.username;
				// req.sessionStore.gameId = req.body.gameId;
				this.videoController.handleNewRoom(gameState);
			});
		}
	}
	// inventory stuff
	useInventoryItem(item){
		// tell the item to go to the corner
		this.graphics.selectItem(item);
	}
	handleClick(x,y){
		// first see if they clicked on a client-side object:
		var result = this.graphics.handleClick(x,y)
		//  check the canvas
		if (!result) {
			var selectedItem = undefined;
			if (this.graphics.selectedItem)
				selectedItem = this.graphics.selectedItem.item.name;
			return this.sendQuery({
				filmName : this.videoController.getVideoName(),
				frameCount: this.videoController.getFrameCount(),
				roomName: this.currentRoom,
				action: 'click',
				x:x,
				y:y,
				selectedItem : selectedItem
			});
		}
		if (result.exit){
			this.hideInventory();
			this.graphics.unselectItem();
		}
		// result.use is the item:
		if (result.use){
			this.hideInventory();
			this.useInventoryItem(result.use)
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
	activateInventory() {
		$.get('/inventory/', function (inventory){
			if (inventory)
				this.graphics.showInventory(inventory);
		});
	}

	showInventory(inventory){
		this.graphics.showInventory(inventory);
	}

	// this.showInventory([{
	// 	img : "/images/girlwithdoll.jpg",
	// 	name : "girlwithdoll"
	// }]);
	hideInventory(){
		this.graphics.hideInventory();
	}
	checkIn(){
		this.getGameState(function(gameState){
			return _.delay(this.checkIn, tickRate);
			 // check in every minute
			// res.json(gameState);
		});
	}
}

if (module) {
	module.exports = CoreController;
}
