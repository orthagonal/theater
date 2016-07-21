const config = require('../../config.js').dev;
const path = require('path');

// Audio controller
function AudioController($){
	var self = this;
	self.soundtrack = null;
	self.audioEffects = {};

    // call on cleanup:
	self.clear = function(jqueryElement){
		this.jqueryElement[0].src ="";
		this.jqueryElement[0].load();
		this.jqueryElement.remove();
		delete(this.jqueryElement);
	}

	self.setSoundtrack = function(src){
		if (self.soundtrack)
			self.clear();
		self.soundtrackJquery = $(`<audio src="${config.soundsDir}${path.sep}${src}" type='audio/mpeg'></audio>`);
		self.soundtrack = self.soundtrackJquery[0];
		self.soundtrack.play();
		self.soundtrack.volume = .2;
		self.soundtrack.loop = true
	}
	self.loadEffect = function(data){
		self.audioEffects[data.name] = $(`<audio src="${config.soundsDir}${path.sep}${data.src}" type='audio/mpeg'></audio>`)[0];
		if (data.volume) self.audioEffects[data.name].volume = data.volume;
		if (data.loop) self.audioEffects[data.name].loop = data.loop;
	}
	self.startEffect = function(data){
		if (self.audioEffects[data.name])
			self.audioEffects[data.name].play()
	}
	self.removeEffect = function(data){
		self.audioEffects[data.name].pause();
		delete self.audioEffects[data.name];
	}
	self.loadEffect({
		name : "ack",
		src : "sounds/button.mp3",
		volume : 1.0,
		loop : false
	})
}

if (global) {
	global.AudioController = AudioController;
}
module.exports = AudioController;
