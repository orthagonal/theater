console.log(process.cwd());
	// server stuff, should move to module
var Server = require('../lib/nwserver.js');

// client begins here:
// yes there are globals:
var videoController; // object that manages video
var graphics = null; // object that manages overlay UI graphics:
var coreController = null;
var videoCanvas = null; // html5 canvas
var videoContext = null; // html5 2d drawing context
// get width and height from canvas element
var height = 1920;
var width = 1080;
var started = false;
var iconsWidth = 60;
var iconsHeight = 60;
var BranchToJunction = 222;
var fontSize = 20;
var yBase = 680;
var thumbWidth = 100;
var thumbHeight = 100;

// milliseconds per tick
var tickRate = 3000;
var playingLoop = true;
var paused = false;
var currentVideoElement = null;
var currentBranch = 0;
var queryType = "dir" // dir, eye, hand

// storage for special client-side functions
var ClientHandlers = {
	RootBehaviors : {},
	LoopBehaviors : {}
}

// loads the url for clipData.title, call begin() when it is ready to play and end() when it ends:
function FilmClip(clipData, begin, end){
	var self = this;
	this.url = clipData.title;
	this.data = clipData;
	// a jquery wrapper for convenience:
	console.log(this.url);
	this.jqueryElement = $("<video src='" + this.url + "' height='0' width='0'></video>");
	this.videoElement = this.jqueryElement[0];
	this.videoElement.src = this.url;
	this.videoElement.oncanplay = begin;
	this.videoElement.onended = end;
	this.videoElement.load();
	this.getFrameCount = function(){
		return Math.floor(self.videoElement.currentTime * 24);
	}
	this.getVideoName = function(){
		return self.data.title;
	}
	this.play = function(){
		this.videoElement.play();
	};

	// call on cleanup:
	this.clear = function(){
		this.videoElement.src ="";
		this.videoElement.load();
		this.jqueryElement.remove();
		delete(this.jqueryElement);
	};
	begin();
}

// Audio controller
function AudioController(){
	var self = this;
	self.soundtrack = null;
	self.audioEffects = {};

    // call on cleanup:
	self.clear = function(jqueryElement){
		this.jqueryElement[0].src ="";
		this.jqueryElement[0].load();
		this.jqueryElement.remove();
		delete(this.jqueryElement);
	}

	self.setSoundtrack = function(src){
		if (self.soundtrack)
			self.clear();
		self.soundtrackJquery = $("<audio src='" + src + "' type='audio/mpeg'></audio>");
		self.soundtrack = self.soundtrackJquery[0];
		self.soundtrack.play();
		self.soundtrack.volume = .2;
		self.soundtrack.loop = true
	}
	self.loadEffect = function(data){
		self.audioEffects[data.name] = $("<audio src='" + data.src + "' type='audio/mpeg'></audio>")[0];
		if (data.volume) self.audioEffects[data.name].volume = data.volume;
		if (data.loop) self.audioEffects[data.name].loop = data.loop;
	}
	self.startEffect = function(data){
		if (self.audioEffects[data.name])
			self.audioEffects[data.name].play()
	}
	self.removeEffect = function(data){
		self.audioEffects[data.name].pause();
		delete self.audioEffects[data.name];
	}
	self.loadEffect({
		name : "ack",
		src : "sounds/button.mp3",
		volume : 1.0,
		loop : false
	})
}

// Text Chain of Text Elements
function TextChain(text, position, fadeOut){
	this.text = text;
	this.textItems = [];
	this.position = position;
	var self = this;
	var index = 0;
	var prevPos = {x:position.x,y:position.y};

	_.each(this.text.split(' '), function(string){
		var textItem = new FloatingWord(string, {x:index, y:self.position.y}, fadeOut);
		self.textItems.push(textItem);
		textItem.randomTween({x:15,y:15},{x:35,y:35});//, {x:index, y:self.position.y});
		if (fadeOut) textItem.fadeOut();
		index += fontSize * string.length;
		textItem.start();
	});

	// return this text if any of the elements of it were clickd on:
	this.handleClick = function(x,y){
		for (var i = 0; i < this.textItems.length; i++) {
			if (this.textItems[i].hitTest(x, y))
				return {text : this.text}
		}
		return ""
	}

	this.setTweens = function(){
		textItem.setTween(newCoord);
	}

	this.firstCall = true;
	this.draw = function(context){
		if (this.firstCall){
			this.firstCall = false;
			for (var i = 1; i < self.textItems.length; i++){
				self.textItems[i].position.x = self.textItems[i-1].position.x + context.measureText(self.textItems[i-1]).width/2;
			}
		}
		_.each(self.textItems, function(n){n.draw(context);});
	}
}

//  Individual Word Element                  //
function FloatingWord(text, position){
	this.text = text;
	this.position = position;
	this.opacity = 1.0;
	var self = this;
	this.width = fontSize * text.length;
	this.height = 20;

	this.hitTest = function(x,y){
		return ((x>this.position.x) && (x<this.position.x+this.width) && (y<this.position.y) && y>this.position.y-this.height)
	}

	this.fadeOut = function(){
		var tween = new TWEEN.Tween({opacity:1.0}).to({opacity:0.0}, 10000)
		.onUpdate(function(){
			self.opacity = this.opacity;
		}).start();
	}

	// generate a random tween:
	this.randomTween = function(  range, anchor){
		var destX = Math.floor(self.position.x + (Math.random() < 0.5 ? -1 : 1) * Math.random() * range.x);
		var destY = Math.floor(self.position.y + (Math.random() < 0.5 ? -1 : 1) * Math.random() * range.y);
		destX = Math.max(0,destX);
		destX = Math.min(640,destX);
		destY = Math.max(0,destY);
		destY = Math.min(480,destY);
		var from = {x:self.position.x, y:self.position.y};
		this.tween = new TWEEN.Tween( from)
            .to( { x: destX , y: destY}, 2000 )
            // .easing( TWEEN.Easing.Elastic.In )
            .onUpdate( function () {
            	if (anchor)
            	{
            		if (Math.abs(this.x - anchor.x) < range.x)
		             	self.position.x = this.x;
            		if (Math.abs(this.y - anchor.y) < range.y)
	    	            self.position.y = this.y;
            	}
            	else
            	{
	             	self.position.x = this.x;
	             	self.position.y = this.y;
            	}
            })
            .onComplete(function() {
            	self.randomTween(range, {x:this.x,y:this.y});
            });
        this.tween.start();
	}

	this.start = function()	{ this.tween.start();	}

	this.draw = function(context)	{ context.fillText(this.text, this.position.x, this.position.y);	}
}

// item when it's center of the screen
function InventoryItem(item){
	var self = this;
	// 'exit' and 'use' icons:
	var xImage = document.createElement('img');
	xImage.src = "/images/x.jpg";
	var useImage = document.createElement('img');
	useImage.src = "/images/use.jpg";
	self.item = item;
	self.position = {x: width/2, y: 10, radians: .35};
	self.element=document.createElement('img');
	this.width = 0; this.height = 0;
	self.element.onload = function(res){
		if (res && res.srcElement){
			self.position.x -= (this.width/3);
			self.width = res.srcElement.width;
			self.height = res.srcElement.height; // Math.max(height-10, res.srcElement.height);
			exitPositionX = self.position.x-10;
			exitPositionY = self.position.y-5;
			usePositionX = self.position.x+self.width-10;
		}
	}
	self.element.src=item.img;
	var exitPositionX = self.position.x-10;
	var exitPositionY = self.position.y-5;
	var usePositionX = self.position.x+self.width-10;
	self.selected = false;
	self.draw = function(context){
		context.save();
		// context.rotate(self.position.radians);
		context.drawImage(self.element,self.position.x, self.position.y, self.width, self.height);
		if (!self.selected){
			// draw the x-out button:
			context.drawImage(xImage,exitPositionX, exitPositionY, iconsWidth, iconsHeight);
			// draw the use button:
			context.drawImage(useImage,usePositionX, exitPositionY, iconsWidth, iconsHeight);
		}
		context.restore();
	}
	this.hitTest = function(x,y){
		return ((x>self.position.x) && (x<self.position.x+self.width)
		 && (y>self.position.y) && y<self.position.y+self.height)
	}
	this.hitExit = function(x,y){
		return ((x>exitPositionX) && (x<exitPositionX+iconsWidth)
		 && (y>exitPositionY) && y<exitPositionY+iconsHeight)
	}
	this.hitUse = function(x,y){
		return ((x>usePositionX) && (x<usePositionX+iconsWidth)
		 && (y>exitPositionY) && y<exitPositionY+iconsHeight)
	}
	this.handleClick = function(x,y){
		if (self.hitExit(x,y))
			return {exit: true} ;
		else if (self.hitUse(x,y))
			return {use: self} ;
		else if (self.hitTest(x,y))
			return {inventory: self.item} ;
	}
}

// inventory thumbnail
function InventoryThumbnail( item, position, size){
	var self = this;
	self.item = item;
	self.position = position;
	if (!self.position.radians){
		self.position.radians = 0;
	}
	self.element=document.createElement('img');
	self.element.src=item.img;
	this.opacity = 1.0;
	this.width = size.width;
	this.height = size.height;
	self.draw = function(context){
		// context.save();
		// context.rotate(self.position.radians)
		context.drawImage(self.element,position.x, position.y, self.width, self.height);
		// context.restore();
	}
	this.hitTest = function(x,y){
		return ((x>self.position.x) && (x<self.position.x+self.width)
		 && (y>self.position.y) && y<self.position.y+self.height)
	}
	this.handleClick = function(x,y){
		if (self.hitTest(x,y))
			return {thumbnail: self.item} ;
	}
}

// item you click on to open the inventory
function InventoryButton(){
	var self = this;
	self.position = {x: 10, y: 10}
	self.width = 50;
	self.height = 50;
	self.element = document.createElement('img'),
	self.element.src="images/inventory.png";
	this.draw = function(context){
		context.drawImage(self.element,self.position.x, self.position.y, self.width, self.height);
	}
	this.hitTest = function(x,y){
		return ((x>self.position.x) && (x<self.position.x+self.width)
		 && (y>self.position.y) && y<self.position.y+self.height)
	}
	this.handleClick = function(x,y){
		if (self.hitTest(x,y))
			return {inventoryButton: true} ;
	}
}

// should have 'style' embedded in the element
function OnscreenHTMLElement(graphics, position, coreController){
	var self = this;
	self.coreController = coreController;
	self.position = position;
	self.rotation = rotation;
	self.width = 50;
	self.height = 50;
	// name to send when queried:
	self.name = graphics.name;
	self.draggable = graphics.draggable;
	self.element = $(graphics.element);
	if (graphics.style)
		self.element.attr('style', graphics.style);
	if (graphics.class)
		self.element.attr('class', graphics.class);
	if (graphics.changehandler){
		self.element.bind("change keyup input", function(evt){
			ClientHandlers[graphics.changehandler](evt, self);
		});
	}
	if (graphics.clickhandler){
		self.element.bind("click", function(evt){
			ClientHandlers[graphics.clickhandler](evt, self);
		});
	}
	if (graphics.draghandler){
		self.element.bind("click",function(evt){
			ClientHandlers[graphics.draghandler](evt, self);
		});
	}
}

// container for all graphics facilities
function Graphics(graphicsCanvas){
	this.videoChainer = null;
	// this.stage.addChild()
	this.graphicsContext = graphicsCanvas.getContext('2d');
	this.textChains = []
	this.inventoryImages= [];
	this.onscreenElements = {};
	var self = this;
		// keep a ref to the main element:
	self.mainElement = $("#mainElement");
	this.addOnscreenElements = function(onscreenElement){
		self.mainElement.append(onscreenElement.element);
		self.onscreenElements[onscreenElement.name] = onscreenElement;
	}
	this.clearOnscreenElements = function(){
		self.mainElement.empty();
		self.onscreenElements = {}
	}

	// this.stage = new createjs.Stage("videoCanvas");
	//this.stage.autoClear = false;
	this.queryEnabled = false;

	// number inputs:
	this.numberInputs = [];
	this.inventory = [];
	this.inventoryButton = new InventoryButton();
	this.showScore = function(score, maxScore){
		this.graphicsContext.font="20px Georgia";
		this.graphicsContext.fillText("You have " + score + "points out of " + maxScore, 10,50);
	}

	this.expandInventoryItem = function(item){
		// get the big image for it
		self.inventoryImages.push(new InventoryItem(item.thumbnail))
	}

	this.showInventory = function(inventory){
		self.selectedItem = undefined;
		self.inventory = inventory;
		var curX = width/2-(2.5*thumbWidth);
		var curY = 300;
		// show the exit icon:
		// self.inventoryImages +=
		for (var i = 0; i < inventory.length; i++){
			if (i!==0 && i%5===0)
				curY += thumbHeight;
			self.inventoryImages.push(new InventoryThumbnail(self.inventory[i], { x:curX + ((i+1)%5) * thumbWidth, y:curY}, {width:thumbWidth, height: thumbHeight}));
		}
		// _.each(inventory, function(item, name){
		// 	var img = new InventoryThumbnail(item, {x:curX, y:curY}, {width:thumbWidth, height: thumbHeight})
		// })
	}
	this.hideInventory = function(){
		self.inventoryImages= [];
	}
	this.showInventoryItem = function(inventory){

	}

	this.handleClick = function(x,y){
		var result = self.inventoryButton.handleClick(x,y)
		if (result) return result;
		for (var i = 0; i < this.textChains.length; i++) {
			var text = this.textChains[i].handleClick(x,y)
			if (text!=="") return text;
		}
		for (var i = 0; i < self.inventoryImages.length; i++) {
			var result = self.inventoryImages[i].handleClick(x,y)
			if (result) return result;
		}
	}

	this.loadJunction = function(junction){
		self.clearOnscreenElements();
		_.each(junction.graphics, function(graphic){
			console.log(graphic);
			// todo: add any special message:
			if (graphic.element){
				self.addOnscreenElements(new OnscreenHTMLElement(graphic, {x:200,y:200}, coreController));
			}
			// if (graphic.text)
			// 	self.addTextChain(graphic.text, graphic.position, graphic.fadeOut)
		});
	}

	this.clearTextChains = function(){
		_.each(this.textChains, function(n){
			delete n;
		})
		this.textChains = []
	}

	this.addTextChain = function(text, position, fadeOut){
		this.textChains.push(new TextChain(text,position,fadeOut))
	}
	this.blackout = true;
	this.blackoutTimer = 24;
	self.selectedItem = undefined;

	self.selectItem = function(item){
		// todo: make it swoop to the corner:
		item.selected = true;
		item.position.x = 10;
		item.position.y = 500;
		item.width = 50;
		item.height = 50;
		self.selectedItem = item;
		$('body').css({cursor: "url(" + self.selectedItem.item.img + ")"});
	}
	self.unselectItem = function(){
		self.selectedItem.selected = false;
		// todo: make it swoop to the corner:
		self.selectedItem = undefined;
	}
	this.draw = function()	{
		// draw any selected item:
		if (self.selectedItem)
			self.selectedItem.draw(self.graphicsContext);
		// draw the inventory items:
		_.each(this.inventoryImages, function(img){
			img.draw(self.graphicsContext);
		});
		if (self.inventoryImages.length===0)
			self.inventoryButton.draw(self.graphicsContext);
		// TWEEN.update();
        //  	this.graphicsContext.fillStyle = "red";//"#d0d0d0";
		// this.graphicsContext.font = "bold 50px TitleFont";
	 	// _.each(this.textChains, function(textItem){
		// 		textItem.draw(self.graphicsContext);
	 	// });
	}
}

//                  Server Interface                       //
function CoreController(testHandler){
	if (testHandler) this.testHandler = testHandler;
	videoCanvas = $('#videoCanvas')[0];
	this.graphics = new Graphics(videoCanvas);
	// graphics.addTextChain("yay", {x:320,y:240}, false);
	this.videoController = new VideoChainer( videoCanvas, this);
	this.graphics.videoChainer = this.videoController
	this.videoController.graphics = this.graphics
	this.graphics.coreController = this
	// loadSpeechAPI();
    // if(videoCanvas.requestFullScreen)
    //     videoCanvas.requestFullScreen();
    // else if(videoCanvas.webkitRequestFullScreen)
    //     videoCanvas.webkitRequestFullScreen();
    // else if(videoCanvas.mozRequestFullScreen)
    //     videoCanvas.mozRequestFullScreen();
	self = this;

	// try to get the current frame of the current video:
	this.getFrameCount = function(){
		return self.videoController.getFrameCount();
      //return (vid.currentTime * 24).toPrecision(6);
    }
    // get the file name of tehe current video:
    this.getVideoName = function(){
    	return self.videoController.getVideoName();
    }
	// put graphics/video here:
	this.sendQuery = function(packet){
		$.post('/query/', packet , self.handleQuery);
	}
	this.handleQuery = function(data){
		if (data.result && data.result.sound){
			self.videoController.audioController.startEffect(data.result.sound);
		}
		if (data.msg==BranchToJunction){
			self.videoController.handleBranch(data.result);
		}
	}
	this.kickstart = function(){
		// get the global value for GAMEID
		GAMEID = 'newGame';
		console.log('gameid is %s', GAMEID);
		var userId = '1';
		if (GAMEID=='newGame'){
			Server.startNewGame( function(runningGameState){
				console.log('runningGameState IS:');
				console.log(runningGameState);
				self.videoController.handleNewJunction(runningGameState);
			});
		}
		else{
			var gameId = '1';
			console.log(clientManager)
			Server.continueExistingGame(gameId, function(gameState){
				console.log('continueExistingGame')
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
			$.post('/click/', {
				filmName : self.videoController.getVideoName(),
				frameCount: self.videoController.getFrameCount(),
				x:x,
				y:y,
				selectedItem : selectedItem
			}, this.handleQuery);
			return;
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

//                  Video Controller                       //
function VideoChainer( videoCanvas, coreController){
	this.videoContext = videoCanvas.getContext('2d');
	this.rootVideoElements = [];
	this.loopVideoElements = [];
	this.otherVideoElements = {};
	this.coreController = coreController;
	FilmClip.prototype.host = this;
	var self = this;
	this.audioController = new AudioController()
	// this.audioController.setSoundtrack("sounds/exhale.wav")
	// this.audioController.autoplay = true
	this.graphics = null;
	self.currentVideoElement = null;
	// placeholders for doing transition effectxs:
	var len = 4 * width * height
    var offset = new Array(len)
	var delta = new Array(len)
	this.junctionLoading = false;
	this.junctionStarted = false;
	this.branchPlaying = false;
	self.behavior = null;//{behavior_type : "splice", interval : "random", min : 500, max : 8000}
	self.currentBranchElement = null;
	// used for transitions between videos:
	var transitionFlags = {
		// which transition to do:
		fade : false,
		overlap : false,
		beginTime : 0, // ms time at start of the
		duration : 0, // number of ms for the
		oldElement : undefined, // prev video element
	}
	// stock video switching schema:
	// for each switching schema there's one way to specify the roots
	// and another way to specify the loops
	this.RootBehaviors = {

		// randomly cut back and forth between clips:
		splice : function(){
			// don't interfere if a branch is playing:
			if (self.branchPlaying) return;
			// either start playing the first root or switch the current video for a root clip:
			if (!self.currentVideoElement){
				self.currentVideoElement = self.rootVideoElements[0];
				self.currentVideoElement.play();
			}
			else{
				self.switchToVideo(self.getRandomClip(self.rootVideoElements));
			}
			var rootPlaying=true;
			// wake up each interval to switch back and forth between videos until done:
			var wakeup = function(){
				// don't interfere if a branch is playing:
				if (self.branchPlaying) return;
				// if a root is playing switch to a loop:
				if (rootPlaying){
					self.switchToVideo(self.getRandomClip(self.loopVideoElements))
					rootPlaying = false
				}
				// if a loop is playing switch to a root:
				else{
					self.switchToVideo(self.getRandomClip(self.rootVideoElements))
					rootPlaying = true
				}
				// set the interval for the next wakeup:
				var interval = parseInt(self.behavior.interval)
				if (self.behavior.interval=="random")
					interval = getRandomInt(self.behavior.min, self.behavior.max);
				_.delay(wakeup, interval)
			}
			wakeup();
		},
		// endlessly repeat this clip:
		repeat : function(){
			// don't interfere if a branch is playing:
			if (self.branchPlaying) return;
			// switch to a random video:
			if (self.currentVideoElement){
				self.switchToVideo(self.getRandomClip(self.rootVideoElements));
			}
			// start the root if nothing playing:
			else{
				self.currentVideoElement = self.rootVideoElements[0];
				self.currentVideoElement.play();
			}
			if (!self.currentVideoElement.jqueryElement.handlerSet){
				self.currentVideoElement.jqueryElement.handlerSet = true;
				self.currentVideoElement.jqueryElement.bind('ended', function(){
					self.playBehavior(ClientHandlers.LoopBehaviors, self.LoopBehaviors);
				});
			}
		},
		// play through the video:
		playthrough : function(destination){
			// don't interfere if a branch is playing:
			if (self.branchPlaying) return;
			// either start playing the first root or switch the current video for a root clip:
			if (!self.currentVideoElement) {
				self.currentVideoElement = self.rootVideoElements[0];
				self.currentVideoElement.play();
			}
			else
				self.switchToVideo(self.getRandomClip(self.rootVideoElements));
			// todo: start loading the next junction:
			// on end branch to the new one:
			self.currentVideoElement.jqueryElement.bind('ended', function(){
				// if it hasn't been set to something else:
				if (self.behavior.behavior_type==='playthrough'){
					// send signal to the server to load the next junction
					self.coreController.sendQuery({query: 'playthrough'})
				}
			});
		},
	}

	// behaviors for the loop videos:
	this.LoopBehaviors = {
		// repeat the video over and over again:
		repeat : function(){
			// do nothing if a branch is playing:
			if (self.branchPlaying) return;
			self.switchToVideo(self.getRandomClip(self.loopVideoElements));
			if (!self.currentVideoElement.jqueryElement.handlerSet){
				self.currentVideoElement.jqueryElement.handlerSet = true;
				self.currentVideoElement.jqueryElement.bind('ended', function(){
					// self.playRoot();
					self.playBehavior(ClientHandlers.RootBehaviors, self.RootBehaviors);
				});
			}
		},
		// do I use these?
		splice : function(){
		},
		playthrough : function(){
		}
	}

	// try to get the current frame of the current video:
	this.getFrameCount = function(){
		return self.currentVideoElement.getFrameCount();
      //return (vid.currentTime * 24).toPrecision(6);
    }
    // get the file name of tehe current video:
    this.getVideoName = function(){
    	return self.currentVideoElement.getVideoName();
    }
    // detect if its dstill playing:
	this.isPlaying = function(){
		return !self.currentVideoElement.paused && !self.currentVideoElement.ended;
	};
	// get a random integer:
	function getRandomInt(min, max) {
    	return Math.floor(Math.random() * (max - min + 1)) + min;
	}

	// TEST THIS NEXT
	// fire a behavior from a customer behavior set,
	// if not found fire one from a backup set of behaviors:
	this.playBehavior = function(behaviorSet, backupSet){
		// play a customer behavior if present`
		if (behaviorSet[self.behavior.behavior_type])
			behaviorSet[self.behavior.behavior_type](self);
		else
			backupSet[self.behavior.behavior_type]();
	}

	this.loadJunction = function(junction, allDone, end){
		this.clearPreviousJunction()
		self.currentJunction = junction;
		this.junctionLoading = true;
		this.junctionStarted = false;
		// load roots:
		async.auto({
			roots: function(rootsDone) {
				async.each(junction.roots, function(junctionRoot, done){
					console.log('load root');
					console.log(junctionRoot);
					self.rootVideoElements.push(new FilmClip(junctionRoot, function(evt) {
						return done();
					}, end));
				}, function(){
					rootsDone();
				});
			},
			loops: function(loopDone) {
				async.each(junction.roots, function(junctionLoop, done){
					self.loopVideoElements.push(new FilmClip(junctionLoop, function(evt) {
						console.log('evt is return')
						return done();
					}, end));
				}, function(err){
					console.log('loopDone')
					loopDone();
				});
			},
			finally: function(done, result) {
				allDone(null, result);
				done();
			}
		}, function(err, res) {
			console.log(res)
			allDone(err, res);
		});
		// load deaths:
		// for ( i = 0; i < _.keys(junction.others).length; i++){
		// 	//this.otherVideoElements[junction.others[i]] = new FilmClip(junction.deaths[i], begin, end);
		// }
	};

	this.getRandomClip = function(set){
		var start = Math.floor(Math.random() * 1000);
		return set[start%set.length];
	};

	this.doTransitionFade = function(w,h){
		self.videoContext.clearRect(0,0, w,h);
		// draw the correct image:
		var expired = new Date().getTime() - transitionFlags.beginTime
		var progress = expired/transitionFlags.duration
		// if we're done:
		if (expired > transitionFlags.duration ){
			self.videoContext.globalAlpha = 1
			transitionFlags.fade=false;
			transitionFlags.oldElement.videoElement.pause()
			transitionFlags.oldElement = undefined
			self.videoContext.drawImage(self.currentVideoElement.videoElement,0,0,w,h);
		}
		// if we're less than halfway done fade it out:
		else if (progress < 0.5){
			// self.videoContext.drawImage(self.currentVideoElement.videoElement,0,0,w,h);
			self.videoContext.drawImage(transitionFlags.oldElement.videoElement,0,0,w,h);
			self.videoContext.globalAlpha = 1 - (progress*2)
		}
		// if we're more than halfway done start fading in:
		else{
			self.videoContext.drawImage(self.currentVideoElement.videoElement,0,0,w,h);
			self.videoContext.globalAlpha = progress
		}
	}

	// the overlap transition:
	this.doTransitionOverlap = function(w,h){
		self.videoContext.clearRect(0,0, w,h);
		// draw the correct image:
		var expired = new Date().getTime() - transitionFlags.beginTime
		var progress = expired/transitionFlags.duration
		// if we're done:
		if (expired > transitionFlags.duration ){
			self.videoContext.globalAlpha = 1
			transitionFlags.overlap=false;
			transitionFlags.oldElement.videoElement.pause()
			transitionFlags.oldElement = undefined
			self.videoContext.drawImage(self.currentVideoElement.videoElement,0,0,w,h);
		}
		else{
			self.videoContext.drawImage(self.currentVideoElement.videoElement,0,0,w,h);
	        var source = self.videoContext.getImageData(0, 0, width, height);
			self.videoContext.drawImage(transitionFlags.oldElement.videoElement,0,0,w,h);
	        var target = self.videoContext.getImageData(0, 0, width, height);
	        var result = self.videoContext.createImageData(width, height);
			for (var i = 0; i < len; i += 1) {
	            offset[i] = target.data[i];
	            delta[i] = source.data[i] - target.data[i];
	            result.data[i] = 255;
	        }
	    	r = result.data;
	    	var value = 0.5 + 0.5 * Math.sin(progress)
	    	for (i = 0; i < len; i += 4) {
		        r[i] = offset[i] + delta[i] * value
		        r[i + 1] = offset[i + 1] + delta[i + 1] * value
		        r[i + 2] = offset[i + 2] + delta[i + 2] * value
		    }
			self.videoContext.putImageData(result, 0, 0);
		}
    }

    // this needs to update at the right rate
    // this needs to sync up to bounding-box frames
    // this needs to show bounding box overlay if active
	this.draw = function(w,h) {
		if (!self.currentVideoElement) {
	   		setTimeout(self.draw,20,w,h);
			return
		}
		if (transitionFlags.fade)
			self.doTransitionFade(w,h)
		else if (transitionFlags.overlap)
			self.doTransitionOverlap(w,h)
		else
			self.videoContext.drawImage(self.currentVideoElement.videoElement,0,0,w,h);
		// write the overlay stuff:
		self.videoContext.globalCompositeOperation = 'source-over'
		var prevAlpha = self.videoContext.globalAlpha
		self.videoContext.globalAlpha = 1;
		self.graphics.draw();
		self.videoContext.globalAlpha = prevAlpha;
		setTimeout(self.draw,15,w,h);
	}

	// transition from one video to another using the indicated transition type:
	this.switchToVideo = function(video, effect){
		// if no effect
		if (!effect){
			var oldElement = self.currentVideoElement;
			video.play();
			self.currentVideoElement = video;
			oldElement.videoElement.pause();
			return;
		}
		switch (effect.name){
			case 'fade':
				transitionFlags.fade = true;
				transitionFlags.oldElement = self.currentVideoElement
				transitionFlags.beginTime = new Date().getTime()
				transitionFlags.duration = effect.param1
				transitionFlags.blackoutPeriod = effect.param2 // i'll implement this later
				video.play()
				self.currentVideoElement = video;
			break;
			case 'overlap':
				transitionFlags.overlap = true;
				transitionFlags.oldElement = self.currentVideoElement
				transitionFlags.beginTime = new Date().getTime()
				transitionFlags.duration = effect.param1
				transitionFlags.blackoutPeriod = effect.param2 // i'll implement this later
				video.play()
				self.currentVideoElement = video;
			break;
		}
	}

	self.end = function(){
		// play something else
	}

	// erase the previous junction:
	self.clearPreviousJunction = function()	{
		function clearClip(clip){
			clip.clear();
			delete clip;
		}
		// todo: loop over the previus junctions actual list of FilmClips:
		_.each(self.rootVideoElements, clearClip)
		_.each(self.loopVideoElements, clearClip)
		_.each(self.otherVideoElements, clearClip)
		this.rootVideoElements = [];
		this.loopVideoElements = [];
		this.otherVideoElements = {};
	}

	// when we get a new junction:
	this.handleNewJunction = function(junction){
		self.behavior = junction.behavior
		self.currentJunction = junction.junction
		self.currentJunctionName = junction.junctionName;
		var started = false;
		async.auto({
			// load junction play elements:
			load: function(done) {
				self.loadJunction(self.currentJunction, function(){
					console.log('junction load done')
					done();
				}, self.end);
			},
			// load junction graphical elements:
			graphics: function(done, results) {
				self.graphics.loadJunction(junction);
				console.log('graphics done ');
				done();
			}
		}, function(err, result) {
			console.log("next")
 			try{
 				self.junctionLoading = false;
				console.log('starting....')
 				if (!started){
 					// self.playRoot();
					console.log('starting....')
 					self.playBehavior(ClientHandlers.RootBehaviors, self.RootBehaviors);
 					started = true;
 				}
 			}
 			catch(e){
 				console.log(e)
 			}
 		});
	}
	// when we branch to a new junction
	this.handleBranch = function(bracket){
		// if we're self-branching to the same junction:
		if (bracket.junctionName === self.currentJunctionName){
			var start = function(){
				self.branchPlaying = true;
				self.switchToVideo(self.currentBranchElement);
				self.currentBranchElement.play();
			}
			var end = function(){
				// branch to the junction when this ends
				self.branchPlaying = false;
				// self.playRoot()
				self.playBehavior(ClientHandlers.RootBehaviors, self.RootBehaviors);
			}
		}
		// if we're branching to a new junction:
		else{
			// repeat branches will wait until the end of the current sequence:
			if (self.behavior.behavior_type==='repeat'){
				// will queue this to play when the current video has ended:
				var start = function(){
					// reset the current element to play this one:
					self.currentVideoElement.videoElement.onended = function(){
						self.branchPlaying = true;
						self.switchToVideo(self.currentBranchElement, bracket.behavior.effect);
						self.loadJunction(bracket.junction, undefined, undefined);
						self.graphics.loadJunction(bracket);
					};
				}
			} else {
			// short-circuiting branches will play instantly:
				// load the branch as an element
				var start = function(){
					self.branchPlaying = true;
					self.switchToVideo(self.currentBranchElement, bracket.behavior.effect)
					self.loadJunction(bracket.junction, undefined, undefined)
					self.graphics.loadJunction(bracket)
				}
			}
			// when it's done playing this callback will start playing the new junction
			// delete any old branch video to save memory:
			var end = function(){
					// branch to the junction when this ends
					self.behavior = bracket.behavior
					self.branchPlaying = false;
					self.playBehavior(ClientHandlers.RootBehaviors, self.RootBehaviors);
					// self.playRoot()
			}
			if (self.currentBranchElement)
				self.currentBranchElement.clear();
		}
		self.currentBranchElement = new FilmClip(bracket.branch, start, end);
	}
	this.draw(videoCanvas.width,videoCanvas.height);
}

function getClipCount(graph){
	return (graph.roots.length + graph.loops.length);
}

function canvasClick(event){
	 coreController.handleClick(event.pageX-videoCanvas.offsetLeft,
		 event.pageY-videoCanvas.offsetTop)
}

// fast map dec to int:
var MapDecToInt = {
	48 : 0,
	49 : 1,
	50 : 2,
	51 : 3,
	52 : 4,
	53 : 5,
	54 : 6,
	55 : 7,
	56 : 8,
	57 : 9
}

// handle buttons for hitboxes
// todo: test this by auto-generating some hitboxes for the videos:
function canvasKey(evt){
	if (MapDecToInt[evt.which])
		coreController.sendQuery({query:"fingers"});
		// $.post('/click/', {
		// 	filmName : coreController.getVideoName(),
		// 	frameCount: coreController.getFrameCount(),
		// 	index : MapDecToInt[evt.which]
		// }, coreController.handleQuery);
  };
