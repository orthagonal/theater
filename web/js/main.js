	// server stuff, should move to module
var CoreController = require("./CoreController.js");
var room_one = require("./room_one.js");
// client begins here:
// yes there are globals:
var videoController; // object that manages video
var graphics = null; // object that manages overlay UI graphics:
var coreController = null;
var videoCanvas = null; // html5 canvas
var videoContext = null; // html5 2d drawing context
// get width and height from canvas element
var started = false;
var iconsWidth = 60;
var iconsHeight = 60;
var BranchToJunction = 222;
var fontSize = 20;
var yBase = 680;
var thumbWidth = 100;
var thumbHeight = 100;

// milliseconds per tick
var tickRate = 3000;
var playingLoop = true;
var paused = false;
var currentVideoElement = null;
var currentBranch = 0;
var queryType = "dir" // dir, eye, hand

global.ClientHandlers = room_one.loadClientHandlers();
function getClipCount(graph){
	return (graph.roots.length + graph.loops.length);
}

function canvasClick(event){
	 coreController.handleClick(event.pageX-videoCanvas.offsetLeft,
		 event.pageY-videoCanvas.offsetTop)
}

// fast map dec to int:
var MapDecToInt = {
	48 : 0,
	49 : 1,
	50 : 2,
	51 : 3,
	52 : 4,
	53 : 5,
	54 : 6,
	55 : 7,
	56 : 8,
	57 : 9
}

// handle buttons for hitboxes
// todo: test this by auto-generating some hitboxes for the videos:
function canvasKey(evt){
	if (MapDecToInt[evt.which]){
		coreController.sendQuery({query:"fingers"});
		// $.post('/click/', {
		// 	filmName : coreController.getVideoName(),
		// 	frameCount: coreController.getFrameCount(),
		// 	index : MapDecToInt[evt.which]
		// }, coreController.handleQuery);
	}
}

// these are all singletons lanyway
exports.start = function start(jquery){
	coreController = new CoreController(jquery)
};
