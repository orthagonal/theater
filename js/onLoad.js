const main = require('./main.js')

// nwjs code:
// set size:
// main = require(process.cwd()+'/js/main.js');
// nw.Screen.Init();
// var theWindow = nw.Screen.screens[0];

module.exports.startGame = function () {
  var theWindow = window;
  var finalDestinationCanvas = document.getElementById("finalDestinationCanvas");
  finalDestinationCanvas.addEventListener("keypress", onClick, false );
  finalDestinationCanvas.width = theWindow.innerWidth;
  finalDestinationCanvas.height = theWindow.innerHeight;
  var hitboxCanvas = document.getElementById("hitboxCanvas");
  hitboxCanvas.width = theWindow.innerWidth;
  hitboxCanvas.height = theWindow.innerHeight;

  main.start(finalDestinationCanvas, hitboxCanvas, $, {
    width: finalDestinationCanvas.width,
    height: finalDestinationCanvas.height,
    // todo: use these in the future
    videoWidth: finalDestinationCanvas.width,
    videoHeight: finalDestinationCanvas.height,
    outputWidth: finalDestinationCanvas.width,
    outputHeight: finalDestinationCanvas.height
  });
};

module.exports.query = main.query;
