'use strict';
	// server stuff, should move to module
const CoreController = require('./CoreController.js');

let coreController = null;
let videoCanvas;
/*
let started = false;

// some globals that may not be needed anymore:
const BranchToJunction = 222;
const fontSize = 20;
const yBase = 680;
const thumbWidth = 100;
const thumbHeight = 100;

// milliseconds per tick
const tickRate = 3000;
let playingLoop = true;
let paused = false;
let currentVideoElement = null;
let currentBranch = 0;
let queryType = "dir" // dir, eye, hand
*/
function loadClientHandlers(path) {
	global.ClientHandlers = require(path).loadClientHandlers();
}
// todo: this needs to be loaded by a user action:
loadClientHandlers('../../modules/IrisOne/js/room_one.js');

function getClipCount(graph) {
	return (graph.roots.length + graph.loops.length);
}

function canvasClick(event) {
	coreController.handleClick(event.pageX - videoCanvas.offsetLeft,
		event.pageY - videoCanvas.offsetTop);
}

// fast map dec to int:
const MapDecToInt = {
	48: 0,
	49: 1,
	50: 2,
	51: 3,
	52: 4,
	53: 5,
	54: 6,
	55: 7,
	56: 8,
	57: 9
};

// handle buttons for hitboxes
// todo: test this by auto-generating some hitboxes for the videos:
function canvasKey(evt) {
	if (MapDecToInt[evt.which]) {
		coreController.sendQuery({ query: 'fingers' });
		// $.post('/click/', {
		// 	filmName : coreController.getVideoName(),
		// 	frameCount: coreController.getFrameCount(),
		// 	index : MapDecToInt[evt.which]
		// }, coreController.handleQuery);
	}
}

// these are all singletons lanyway
exports.start = function start(jquery) {
	coreController = new CoreController(jquery);
	coreController.kickstart('newGame', 'mainUser');
};
exports.click = function click(event) {
	coreController.handleClick(event.clientX, event.clientY);
};
