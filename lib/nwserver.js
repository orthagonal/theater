'use strict';
//
const _ = require('underscore');
const fs = require('fs');
const path = require('path');
const ClientState = require('../lib/ClientState.js');
const ClientManager = ClientState.ClientManager;

let DirectorModule;
let JunctionGraph;
let DirectorObject;
//todo:
// file system instead of mongo
// startNewGame, continueExistingGame, checkIn
// make sure videos are playing

// var User = require('../models/user.js');

// manages the state of each client:
const clientManager = new ClientManager();

var saveGame = exports.saveGame = function(key, gameState, callback){
	clientManager.saveGame(key, gameState, callback);
}

const loadModule = (moduleName) => {
	const modPath = `..${path.sep}modules${path.sep}${moduleName}`;
	DirectorModule = require(`${modPath}${path.sep}js${path.sep}Director.js`);
	JunctionGraph = require(`${modPath}${path.sep}js${path.sep}JunctionGraph.js`);
	DirectorObject = new DirectorModule();
	ClientState.JunctionGraph = JunctionGraph;
};

exports.startNewGame = function(userId, callback) {
	loadModule('IrisOne');
  clientManager.startNewGame(userId, function(initialGameState){
    var runningGameState = DirectorObject.processQuery({query:'start'}, initialGameState)
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
		let result = DirectorObject.processQuery(req, gameState);
		// save the game state here?
		// todo: put this in processquery, only save when gamestate is changed:
		saveGame(result.userId, result, () => {
			console.log('returning callback for saveGame')
			callback(actOnQueryResult(result, gameState));
		});
	});
};
