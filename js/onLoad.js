// only called from dev mode:
const main = require('./main.js')

module.exports.startGame = function (options = {}) {
  // get window, main canvas, and hitbox canvas:
  var theWindow = window;
  options.theWindow = theWindow;
  var finalDestinationCanvas = document.getElementById("finalDestinationCanvas");
  options.finalDestinationCanvas = finalDestinationCanvas;
  finalDestinationCanvas.addEventListener("keypress", onClick, false );
  finalDestinationCanvas.width = theWindow.innerWidth;
  finalDestinationCanvas.height = theWindow.innerHeight;
  options.hitboxCanvas = document.getElementById("hitboxCanvas");
  options.hitboxCanvas.width = theWindow.innerWidth;
  options.hitboxCanvas.height = theWindow.innerHeight;
  options.dimensions = {
    width: finalDestinationCanvas.width,
    height: finalDestinationCanvas.height,
    // todo: use these in the future
    videoWidth: finalDestinationCanvas.width,
    videoHeight: finalDestinationCanvas.height,
    outputWidth: finalDestinationCanvas.width,
    outputHeight: finalDestinationCanvas.height
  };
  options.devMode = true;
  if (!options.$ && $) {
    options.$ = $;
  }
  // now start:
  main.start(options);
};

module.exports.query = main.query;
