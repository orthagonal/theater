'use strict';
const CoreController = require('./CoreController.js');
const path = require('path');
let coreController = null;
let lastTime = new Date().getTime();

// these are all singletons anyway
exports.start = function start(options) {
  // create a game controller and kickstart a module with it:
  options.modulePath = path.join('..', 'modules', 'IrisOne', 'js', 'the_repository_1.js');
  coreController = new CoreController(options);
  coreController.kickstart('newGame', 'mainUser');
};

exports.query = (evt) => {
  // rate limit:
  if (new Date().getTime() - lastTime > 500) {
    lastTime = new Date().getTime();
    // if it's the dev key turn on dev mode:
    if (evt.code === 'KeyD') {
      coreController.toggleDevMode();
    }
    // pass to the module object
    coreController.module.query(evt);
  }
};
