
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
