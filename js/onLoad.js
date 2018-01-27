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
  var burnthrough = document.getElementById("burnthrough");
  burnthrough.width = theWindow.innerWidth;
  burnthrough.height = theWindow.innerHeight;

  main.start(theWindow.videoContext, burnthrough, $);
};

module.exports.query = main.query;
