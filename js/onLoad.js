const main = require('./main.js')
module.exports.startGame = function () {
  // set size:
  // main = require(process.cwd()+'/js/main.js');
  // nw.Screen.Init();
  // var theWindow = nw.Screen.screens[0];
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
