'use strict';
//
const _ = require('underscore');
const fs = require('fs');
const path = require('path');
const ClientState = require('../lib/ClientState.js');
const ClientManager = ClientState.ClientManager;

let DirectorModule;
let SceneGraph;
let DirectorObject;

// manages the state of each client:
const clientManager = new ClientManager();

const saveGame = exports.saveGame = (key, gameState, callback) => {
  console.log('gonna save the game')
  clientManager.saveGame(key, gameState, callback);
};

const loadModule = (moduleName) => {
  const modPath = path.join('..', 'modules', moduleName);
  DirectorModule = require(path.join(modPath, 'js', 'Director.js'));
  SceneGraph = require(path.join(modPath, 'SceneGraph.js'));
  DirectorObject = new DirectorModule();
  ClientState.SceneGraph = SceneGraph;
};

exports.startNewGame = function(userId, callback) {
  loadModule('IrisOne');
  clientManager.startNewGame(userId, (initialGameState) => {
    const runningGameState = DirectorObject.processQuery({ query: 'start' }, initialGameState);
    callback(runningGameState);
  });
};

function getGameState(req, callback) {
  clientManager.getGame({ userId: req.userId }, callback);
}

// emit the correct output based on the result of a query:
function actOnQueryResult(result, clientState) {
  console.log('actOnQueryResult:')
  console.log(result)
  console.log(clientState)
  return {
    msg: 'BranchToScene',
    result,
    sceneName: result.sceneName
  };
}

exports.query = (req, callback) => {
  console.log('nwserver query called')
  getGameState(req, (gameState) => {
    if (!gameState) {
      return;
    }
    console.log('the gamestate is gotten now sending the process command')
    let result = DirectorObject.processQuery(req, gameState);
    console.log('the result was gotten now we gonna save and act on it')
    // todo: save the game first, then update the game state and act on it
    //   callback(actOnQueryResult(result, gameState));
    // save the game state before updating
    // todo: put this in processquery, only save when gamestate is changed:
    // saveGame(result.userId, result, () => {
    //   console.log('returning callback for saveGame')
    // });
  });
};
