'use strict';
const config = require('../../config.js').dev;
const path = require('path');

// loads the url for clipData.title, call begin() when it is ready to play and end() when it ends:
function FilmClip(clipData, begin, end){
	// get the jquery reference:
	const $ = FilmClip.prototype.$;
	var self = this;
	this.data = clipData;
	this.url = clipData.title;
	if (config.mode === 'dev') {
		this.url += '.webm';
	}
	// a jquery wrapper for convenience:
	this.jqueryElement = $(`<video src="${config.moviesDir}${path.sep}${this.url}" height='0' width='0'></video>`);
	this.videoElement = this.jqueryElement[0];
	console.log(this.videoElement.src)
	this.videoElement.oncanplay = begin;
	this.videoElement.onended = end;
	this.getFrameCount = function(){
		return Math.floor(self.videoElement.currentTime * 24);
	};
	this.stop = function(){
		this.videoElement.stop();
	};
	this.getVideoName = function(){
		return self.data.title;
	};
	this.play = function(){
		this.videoElement.play();
	};

	// call on cleanup:
	this.clear = function(){
		this.videoElement.src ="";
		this.videoElement.load();
		this.jqueryElement.remove();
		delete(this.jqueryElement);
	};
	this.start = function() {
		this.videoElement.load();
		begin();
	}
}
if (global) {
	global.FilmClip = FilmClip;
}
module.exports = FilmClip;
