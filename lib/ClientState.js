'use strict';
// var client = require('redis').createClient()
var mongoose = require('mongoose');
var db = require('node-localdb');
var _ = require('underscore');

exports.JunctionGraph = null;

// the current state of the game, one for each
// saved/current game the client is playing:
exports.gameStateSchema = {
	// also uses the _id to specify which gamestate to use
	userId : String, // login of the user object that owns this game state
	active : Boolean, // if they are currently using it (only 1 at a time)
	score : Number, // current score
	junctionName : String,
	// junction : {
	// 	roots : [
	// 		{
	// 			sessionName : String,
	// 			title : String,
	// 		}
	// 	],
	// 	loops : [
	// 		{
	// 			sessionName : String,
	// 			title : String,
	// 		}
	// 	],
	// }, // current junction
	inventory : [{
		name : String,
		img : String,
		desc : String,
		data : String
	}], // list of inventory items
	gameVariables : [{
		varName: String,
		value : String
	}], // variables for the state of the game
}

// exports.GameState = mongoose.model('GameStateModel',  new mongoose.Schema(exports.gameStateSchema));
// todo: figure something out that can store game states inside this server
// instead of this
class GameState {
	constructor() {
		this.db = db('./saves.json');
		this.gameState = {};
	}
	// insert(newThing, callback) {
	// 	this.db.insert(newThing);
	// }
	update(term, newThing, callback) {
		if (term) {
			this.db.find(term).then((result) => {
				if (result.length > 0) {
					this.db.update(term, newThing).then(function(result, c, r) {
						callback(result);
					});
				} else {
					this.db.insert(newThing).then(function(result) {
						callback(result);
					});
				}
			});
		}
	}
	findOne(term, callback) {
		this.db.findOne(term).then(function(result) {
			callback(result);
		});
	}
};

exports.GameState = new GameState();

var log = function(line, params){console.log(line, params)}

// create a client manager:
exports.ClientManager = function(gameStream){
	var self = this;
	// array of clients:
	this.clientStates = {};
	// create and return a new client for this session:
	this.addClientState = function(session){
		self.clientStates[session.token] = new exports.ClientState(session, gameStream);
	};

	// (key should be the userId key)
	this.saveGame = function(session, objectToStore, callback){
		exports.GameState.update({ userId: objectToStore.userId }, _.omit(objectToStore, '_id'), callback);
	}

	// try to get the state from redis, if not found get it from mongo
	// key should be the userId key
	this.getGame = function(key, callback) {
		// 	// if it's not in redis get it from mongo:
		exports.GameState.findOne(key, function(result){
			if (_.isObject(result))
				callback(result);
		});
	}

	this.getSavedGames = function(session, callback){
		exports.GameState.find({ userId : session.userId}, function(err,results){
			if (err){
				console.log(err); return;
			}
			console.log("saved games found %d", results.length)
			callback(results);
		});
	}

	this.restoreOrStart = function(userId, sessionId, callback){
		console.log("userId is %s", userId)
		if (!result){
			console.log("no prev state found")
			self.startNewGame(userId, callback)
		}
		else{
			console.log("found a prev state")
			var object = result.toObject();
			self.refreshJunction(object);
			callback(object);
		}
	}

	// restore the junction's data based no it having only a name
	this.refreshJunction = function(result)	{
		result.junction = exports.JunctionGraph[result.junctionName]
	}

	// start a new game state for this session id:
	this.startNewGame = function(userId, callback)	{
		var gameData = {
			userId,
			active : true,
			score : 0,
			junctionName : "Prologue",
			junction : exports.JunctionGraph.Prologue,
			inventory : [],
			gameVariables : []
		}
		// save it and return
		self.saveGame(userId, gameData, callback);
	}
};
