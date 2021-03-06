'use strict';
const CoreController = require('./CoreController.js');
const path = require('path');
let coreController = null;
let lastTime = new Date().getTime();
let started = false;

// these are all singletons anyway
exports.start = function start(options) {
  if (started) {
    return;
  }
  started = true;
  // create a game controller and kickstart a module with it:
  options.modulePath = path.join('..', 'modules', 'IrisOne', 'js', 'module.js');
  coreController = new CoreController(options);
  coreController.kickstart('newGame', 'mainUser');
};

exports.query = (evt) => {
  // rate limit:
  // if (new Date().getTime() - lastTime > 3000) {
  if (new Date().getTime() - lastTime > 0) {
    lastTime = new Date().getTime();
    // if it's the dev key turn on dev mode:
    // if (evt.code === 'KeyD') {
    //   coreController.toggleDevMode();
    // }
    // pass to the module object
    coreController.module.query(evt);
  }
};
