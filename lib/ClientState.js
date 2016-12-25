'use strict';
// let client = require('redis').createClient()
const db = require('node-localdb');
const _ = require('underscore');

exports.SceneGraph = null;

// the current state of the game, one for each
// saved/current game the client is playing:
exports.gameStateSchema = {
  // also uses the _id to specify which gamestate to use
  userId : String, // login of the user object that owns this game state
  active : Boolean, // if they are currently using it (only 1 at a time)
  score : Number, // current score
  sceneName : String,
  // scene : {
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
  // }, // current scene
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

const log = function(line, params) {
  console.log(line, params);
}

// create a client manager:
class ClientManager {
  constructor(gameStream) {
    // all clients:
    this.clientStates = {};
  }
  // create and return a new client for this session:
  addClientState(session) {
    this.clientStates[session.token] = new exports.ClientState(session, gameStream);
  };
  // (key should be the userId key)
  saveGame(session, objectToStore, callback) {
    exports.GameState.update({ userId: objectToStore.userId }, _.omit(objectToStore, '_id'), callback);
  }

  // try to get the state from redis, if not found get it from mongo
  // key should be the userId key
  getGame(key, callback) {
    // 	// if it's not in redis get it from mongo:
    exports.GameState.findOne(key, function(result) {
      if (_.isObject(result))
      callback(result);
    });
  }

  getSavedGames(session, callback) {
    exports.GameState.find({ userId : session.userId}, function(err,results) {
      if (err) {
        console.log(err); return;
      }
      console.log("saved games found %d", results.length)
      callback(results);
    });
  }

  restoreOrStart(userId, sessionId, callback) {
    console.log("userId is %s", userId)
    if (!result) {
      console.log("no prev state found")
      this.startNewGame(userId, callback)
    }
    else{
      console.log("found a prev state")
      let object = result.toObject();
      this.refreshScene(object);
      callback(object);
    }
  }

  // restore the scene's data based no it having only a name
  refreshScene (result)	{
    result.scene = exports.SceneGraph[result.sceneName]
  }

  // start a new game state for this session id:
  startNewGame (userId, callback)	{
    let gameData = {
      userId,
      active: true,
      score: 0,
      sceneName: "Title",
      scene: exports.SceneGraph.Title,
      inventory: [],
      gameVariables: []
    }
    // save it and return
    this.saveGame(userId, gameData, callback);
  }
};

module.exports.ClientManager = ClientManager;
