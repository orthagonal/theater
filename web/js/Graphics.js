var Text = require("./Text.js");
var Inventory = require("./Inventory.js");
var InventoryItem = Inventory.InventoryItem;
var InventoryButton = Inventory.InventoryButton;
var InventoryThumbnail = Inventory.InventoryThumbnail;

// should have 'style' embedded in the element
function OnscreenHTMLElement(graphics, position, coreController, $){
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
function Graphics(graphicsCanvas, $){
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
				self.addOnscreenElements(new OnscreenHTMLElement(graphic, {x:200,y:200}, self.coreController, $));
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
module.exports = Graphics;
