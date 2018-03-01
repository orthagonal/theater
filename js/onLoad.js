const main = require('./main.js')
module.exports.startGame = function () {
  // set size:
  // main = require(process.cwd()+'/js/main.js');
  // nw.Screen.Init();
  // var theWindow = nw.Screen.screens[0];
  var theWindow = window;
  var videoCanvas = document.getElementById("videoCanvas");
  videoCanvas.addEventListener("keypress", onClick, false );
  videoCanvas.width = theWindow.innerWidth;
  videoCanvas.height = theWindow.innerHeight;
  theWindow.videoContext = new VideoContext(videoCanvas);
  theWindow.videoContext.DEFINITIONS = VideoContext.DEFINITIONS;
  var hitboxCanvas = document.getElementById("hitboxCanvas");
  hitboxCanvas.width = theWindow.innerWidth;
  hitboxCanvas.height = theWindow.innerHeight;

  main.start(theWindow.videoContext, hitboxCanvas, $);
};

module.exports.query = main.query;
