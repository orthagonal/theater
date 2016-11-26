'use strict';
const config = require('../../config.js').production;
const path = require('path');

// loads the url for clipData.title, call begin() when it is ready to play and end() when it ends:
class FilmClip {
  constructor(clipData, begin, end) {
		// get the jquery reference:
    const $ = FilmClip.prototype.$;
    this.data = clipData;
    this.url = clipData.title;
    if (config.mode === 'dev') {
      this.url += '.avi';
    }
		// a jquery wrapper for convenience:
    const src = path.normalize(`${config.moviesDir}${path.sep}${this.url}`);
    console.log('loading source %s', src);
    this.jqueryElement = $(`<video src="${src}" height='0' width='0'></video>`);
    this.videoElement = this.jqueryElement[0];
    this.videoElement.oncanplay = begin;
    this.videoElement.onended = end;
  }

  getFrameCount() {
    return Math.floor(this.videoElement.currentTime * 24);
  }
  stop() {
    this.videoElement.stop();
  }
  getVideoName() {
    return this.data.title;
  }

  play() {
    this.videoElement.play();
  }

  // call on cleanup:
  clear() {
    this.videoElement.src = '';
    this.videoElement.load();
    this.jqueryElement.remove();
    delete(this.jqueryElement);
  }
  start() {
    this.videoElement.load();
    console.log('starting');
    this.oncanplay();
    console.log('done');
  }
}

if (global) {
  global.FilmClip = FilmClip;
}
module.exports = FilmClip;
