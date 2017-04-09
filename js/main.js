'use strict';
const CoreController = require('./CoreController.js');
const path = require('path');
let coreController = null;

// these are all singletons anyway
exports.start = function start(videoContext, jquery) {
  // create a game controller and kickstart a module with it:
  const modulePath = path.join('..', 'modules', 'IrisOne', 'js', 'the_repository_1.js');
  coreController = new CoreController(videoContext, modulePath, jquery);
  coreController.kickstart('newGame', 'mainUser');
};

exports.click = (x, y, modifier) => {
  // pass to the module object
};
