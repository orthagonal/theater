// server stuff, should move to module
'use strict';
const CoreController = require('./CoreController.js');
const path = require('path');
let coreController = null;
let videoCanvas;

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
exports.start = function start(jquery, width, height) {
	// todo: make modules be npm modules:
	coreController = new CoreController(path.join(process.cwd(), 'modules', 'IrisOne', 'js' ,'the_repository_1.js'), jquery, width, height);
	coreController.kickstart('newGame', 'mainUser');
	// todo: this needs to be loaded by a user action:
};

exports.click = function click(event) {
	coreController.handleClick(event.clientX, event.clientY);
};
