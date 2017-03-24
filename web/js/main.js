'use strict';
const CoreController = require('./CoreController.js');
const path = require('path');
let coreController = null;

// these are all singletons anyway
exports.start = function start(jquery, width, height) {
  // todo: make modules be npm modules:
  const modulePath = path.join(process.cwd(), 'modules', 'IrisOne', 'js', 'the_repository_1.js');
  coreController = new CoreController(modulePath, jquery, width, height);
  coreController.kickstart('newGame', 'mainUser');
};
