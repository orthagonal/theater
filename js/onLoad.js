// only called from dev mode:
const main = require('./main.js')

module.exports.startGame = function (options = {}) {
  // get window, main canvas, and hitbox canvas:
  var theWindow = window;
  options.theWindow = theWindow;
  // set up final destination:
  var finalDestinationCanvas = document.getElementById("finalDestinationCanvas");
  options.finalDestinationCanvas = finalDestinationCanvas;
  finalDestinationCanvas.addEventListener("keypress", onClick, false );
  finalDestinationCanvas.width = theWindow.innerWidth;
  finalDestinationCanvas.height = theWindow.innerHeight;
  // set up hitbox canvas:
  options.hitboxCanvas = document.getElementById("hitboxCanvas");
  options.hitboxCanvas.width = theWindow.innerWidth;
  options.hitboxCanvas.height = theWindow.innerHeight;
  // set up textbox canvas:
  var textCanvas = document.getElementById("textCanvas");
  options.textCanvas = textCanvas;
  textCanvas.addEventListener("keypress", onClick, false );
  textCanvas.width = theWindow.innerWidth;
  textCanvas.height = theWindow.innerHeight;
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
