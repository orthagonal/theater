'use strict';

// item when it's center of the screen
class InventoryItem{
	constructor(item){
		// 'exit' and 'use' icons:
		var xImage = document.createElement('img');
		xImage.src = "/images/x.jpg";
		var useImage = document.createElement('img');
		useImage.src = "/images/use.jpg";
		this.item = item;
		this.position = {x: width/2, y: 10, radians: .35};
		this.element=document.createElement('img');
		this.width = 0; this.height = 0;
		this.element.onload = function(res){
			if (res && res.srcElement){
				this.position.x -= (this.width/3);
				this.width = res.srcElement.width;
				this.height = res.srcElement.height; // Math.max(height-10, res.srcElement.height);
				exitPositionX = this.position.x-10;
				exitPositionY = this.position.y-5;
				usePositionX = this.position.x+this.width-10;
			}
		};
		this.element.src=item.img;
		var exitPositionX = this.position.x-10;
		var exitPositionY = this.position.y-5;
		var usePositionX = this.position.x+this.width-10;
		this.selected = false;
	}
	draw(context){
		context.save();
		// context.rotate(this.position.radians);
		context.drawImage(this.element,this.position.x, this.position.y, this.width, this.height);
		if (!this.selected){
			// draw the x-out button:
			context.drawImage(xImage,exitPositionX, exitPositionY, iconsWidth, iconsHeight);
			// draw the use button:
			context.drawImage(useImage,usePositionX, exitPositionY, iconsWidth, iconsHeight);
		}
		context.restore();
	}

	hitTest(x,y){
		return ((x>this.position.x) && (x<this.position.x+this.width)
		 && (y>this.position.y) && y<this.position.y+this.height)
	}
	hitExit(x,y){
		return ((x>exitPositionX) && (x<exitPositionX+iconsWidth)
		 && (y>exitPositionY) && y<exitPositionY+iconsHeight)
	}
	hitUse(x,y){
		return ((x>usePositionX) && (x<usePositionX+iconsWidth)
		 && (y>exitPositionY) && y<exitPositionY+iconsHeight)
	}
	handleClick(x,y){
		if (this.hitExit(x,y))
			return {exit: true} ;
		else if (this.hitUse(x,y))
			return {use: this} ;
		else if (this.hitTest(x,y))
			return {inventory: this.item} ;
	}
}

// inventory thumbnail
class InventoryThumbnail{
	constructor( item, position, size){
		this.item = item;
		this.position = position;
		if (!this.position.radians){
			this.position.radians = 0;
		}
		this.element=document.createElement('img');
		this.element.src=item.img;
		this.opacity = 1.0;
		this.width = size.width;
		this.height = size.height;
	}
	draw(context) {
			context.drawImage(this.element,position.x, position.y, this.width, this.height);
		};
	hitTest(x,y){
		return ((x>this.position.x) && (x<this.position.x+this.width)
		 && (y>this.position.y) && y<this.position.y+this.height)
	}
	handleClick(x,y){
		if (this.hitTest(x,y))
			return {thumbnail: this.item} ;
	}
}

// item you click on to open the inventory
class InventoryButton{
	constructor() {
		this.position = {x: 10, y: 10}
		this.width = 50;
		this.height = 50;
		this.element = document.createElement('img'),
		this.element.src="/web/images/inventory.png";
	}
	draw(context){
		context.drawImage(this.element,this.position.x, this.position.y, this.width, this.height);
	}
	hitTest(x,y){
		return ((x>this.position.x) && (x<this.position.x+this.width)
		 && (y>this.position.y) && y<this.position.y+this.height)
	}
	handleClick(x,y){
		if (this.hitTest(x,y))
			return {inventoryButton: true} ;
	}
}

module.exports.InventoryItem = InventoryItem;
module.exports.InventoryButton = InventoryButton;
module.exports.InventoryThumbnail = InventoryThumbnail;
