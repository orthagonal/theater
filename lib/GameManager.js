@@ -0,0 +1,51 @@
var GameManager = function(director){
	// Start Binary.js server
	self = this;
	this.director = director;
	this.director.gameStream = this;
	this.readStreams = {}; // indexed by clientId
	// this.bs = new BinaryServer.BinaryServer({port: 9000});
	// todo: this may need to report back to socket.io to tell the client their id
	// this.bs.on('connection', function(client){
 //      // console.dir(client);
	//   self.readStreams[client.id] = null;//fs.createReadStream(__dirname + '/movies/look_in.mp4');
	//   // client.send(self.readStreams[client.id]);
	//   // self.readStreams[client.id].on('close', function(){
	//   // 	console.log("closed!");
	//   // });
	//   // todo: have this call the director updater to pick the next video:
	//   // self.readStreams[client.id].on('end', function(){
	//   // 	self.switchClient(client.id, 2);
	//   // });
	// });


	this.switchClient = function(clientId, destinationIndex)
	{
		// self.readStreams[clientId] = fs.createReadStream(__dirname + this.getMovie(destinationIndex));
	    // self.bs.clients[clientId].send(self.readStreams[clientId]);
		// console.log("switching client " + clientId);

		// get the ip/identity of the client stored when connecting to both socket.io and binaryserver
		// if (!self.readStreams[clientId]) {
		// 	console.log('clientID ' + clientId + " not found!");
		// 	console.dir(self.readStreams);
		// 	return;
		// }

  		// self.readStreams[clientId] = fs.createReadStream(__dirname + getMovie(destinationIndex));//movies/look_in_side.mp4');
		// self.bs.clients[clientId].send(self.readStreams[clientId], {test:"meta"});
	}

	this.onTick = function()
	{
		_.delay(self.onTick, 1000);
	}

	this.processQuery = function(query, gameState)
	{
		return this.director.processQuery(query, gameState);
	}
};

exports.GameManager = GameManager;
\ No newline at end of file
