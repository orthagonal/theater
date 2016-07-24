'use strict';
const config = require('../../config.js').dev;
const path = require('path');

// loads the url for clipData.title, call begin() when it is ready to play and end() when it ends:
class FilmClip{
	constructor(clipData, begin, end) {
		// get the jquery reference:
		const $ = FilmClip.prototype.$;
		this.data = clipData;
		this.url = clipData.title;
		if (config.mode === 'dev') {
			this.url += '.webm';
		}
		// a jquery wrapper for convenience:
		this.jqueryElement = $(`<video src="${config.moviesDir}${path.sep}${this.url}" height='0' width='0'></video>`);
		this.videoElement = this.jqueryElement[0];
		this.videoElement.oncanplay = begin;
		this.videoElement.onended = end;
	}
	getFrameCount(){
		return Math.floor(self.videoElement.currentTime * 24);
	};
	stop(){
		this.videoElement.stop();
	};
	getVideoName(){
		return self.data.title;
	};
	play(){
		this.videoElement.play();
	};

	// call on cleanup:
	clear(){
		this.videoElement.src ="";
		this.videoElement.load();
		this.jqueryElement.remove();
		delete(this.jqueryElement);
	};
	start() {
		this.videoElement.load();
		begin();
	}
}

if (global) {
	global.FilmClip = FilmClip;
}
module.exports = FilmClip;
