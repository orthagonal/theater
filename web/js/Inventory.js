module.exports.InventoryItem = InventoryItem;
module.exports.InventoryButton = InventoryButton;
module.exports.InventoryThumbnail = InventoryThumbnail;

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
	self.element.src="/web/images/inventory.png";
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
