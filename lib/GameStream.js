var GameStream = function(director){
	self = this;
	this.director = director;
	this.director.gameStream = this;

	this.onTick = function()
	{
		_.delay(self.onTick, 1000);
	}

	this.processQuery = function(query, gameState)
	{
		return this.director.processQuery(query, gameState);
	}

	this.startGame = function()
	{
		return this.director.getStartJunction()
	}
};

exports.GameStream = GameStream;
\ No newline at end of file
