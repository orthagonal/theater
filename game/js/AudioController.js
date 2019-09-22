'use strict';
const config = {};
const path = require('path');

// Audio controller
class AudioController {
  constructor($) {
    this.soundtrack = null;
    this.audioEffects = {};
    this.$ = $;
  }

  // call on cleanup:
  clear() {
    this.jqueryElement[0].src = '';
    this.jqueryElement[0].load();
    this.jqueryElement.remove();
    delete(this.jqueryElement);
  }

  setSoundtrack(src) {
    if (this.soundtrack) {
      this.clear();
    }
    this.soundtrackJquery = this.$(`<audio src="${config.soundsDir}${path.sep}${src}" type='audio/mpeg'></audio>`);
    this.soundtrack = this.soundtrackJquery[0];
    this.soundtrack.play();
    this.soundtrack.volume = 0.2;
    this.soundtrack.loop = true;
  }

  loadEffect(data) {
    data = typeof data === 'string' ? { name: data } : data;
    this.audioEffects[data.name] = this.$(`<audio src="${config.soundsDir}${path.sep}${data.src}" type='audio/mpeg'></audio>`)[0];
    if (data.volume) {
      this.audioEffects[data.name].volume = data.volume;
    }
    if (data.loop) {
      this.audioEffects[data.name].loop = data.loop;
    }
  }

  startEffect(name, callback) {
    if (this.audioEffects[name]) {
      this.audioEffects[name].addEventListener('ended', callback, true);
      console.log('launching %s', name)
      console.log(this.audioEffects[name])
      this.audioEffects[name].play();
    }
  }
  removeEffect(data) {
    this.audioEffects[data.name].pause();
    delete this.audioEffects[data.name];
  }
}

if (global) {
  global.AudioController = AudioController;
}
module.exports = AudioController;
