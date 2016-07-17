'use strict';
//
var _ = require('underscore');
var fs = require('fs');
var DirectorBase = require('../lib/Director.js');
var RoomOneDirectorModule = require('../lib/RoomOneDirector.js');
var RoomOneJunction = require('../lib/RoomOneJunction.js');
var ClientState = require('../lib/ClientState.js');
var ClientManager = ClientState.ClientManager;

//todo:
// file system instead of mongo
// startNewGame, continueExistingGame, checkIn
// make sure videos are playing

// var User = require('../models/user.js');
ClientState.JunctionGraph = RoomOneDirectorModule.JunctionGraph;

var RoomOneDirector = new DirectorBase.Director( );
// overload a director for Room One:
RoomOneDirectorModule.overloadDirector(RoomOneDirector);
// manages the state of each client:
var clientManager = new ClientManager();

var saveGame = exports.saveGame = function(key, gameState, callback){
	clientManager.saveGame(key, gameState, callback);
}

exports.startNewGame = function(userId, callback) {
  clientManager.startNewGame(userId, function(initialGameState){
    //	 and assign the _id for it to the new session
    // 'kick-start' the game state!
    var runningGameState = RoomOneDirectorModule.processQuery({query:'start'}, initialGameState)
    callback(runningGameState);
  });
}

function getGameState(req, callback) {
	clientManager.getGame({ userId: req.userId }, callback);
}

// emit the correct output based on the result of a query:
function actOnQueryResult(result, clientState){
	return {
		msg:'BranchToJunction',
		result:result,
		junctionName : result.junctionName
	}
}
exports.query = (req, callback) => {
	getGameState(req, function(gameState){
		if (!gameState) {
			console.log("no gamestate found");// for %s", req.sessionStore.token);
			return;
		}
		let result = RoomOneDirectorModule.processQuery(req, gameState);
		// save the game state here?
		// todo: put this in processquery, only save when gamestate is changed:
		saveGame(result.userId, result, () => {
			console.log('returning callback for saveGame')
			callback(actOnQueryResult(result, gameState));
		});
	});
};
