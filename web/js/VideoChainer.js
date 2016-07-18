//                  Video Controller
// handles loading a junction's videos,
// handles showing the current playing video
// handles showing the graphics on top of the video
// handles transitioning between videos when onend events are called

// graphics loop fires every 20 milliseconds

// a junction has a

// load junction will:
// create all junction film elements
// add a series of onend event handlers to chain a group of them together
// onend switches it to the next video
/*
*/

var FilmClip = require('./FilmClip');
var AudioController = require('./AudioController');
var async = require('async');
var _ = require('lodash');
// this is pretty complicated, might be better to do game loop with
// async.until, etc
function VideoChainer( videoCanvas, coreController, options, $){

	this.width = 1720;//options.width;
	this.height = 1000;//options.height;
	this.videoContext = videoCanvas.getContext('2d');
	this.rootVideoElements = [];
	this.loopVideoElements = [];
	this.otherVideoElements = {};
	this.coreController = coreController;
	FilmClip.prototype.host = this;
	FilmClip.prototype.$ = $;
	var self = this;
	this.audioController = new AudioController($)
	// this.audioController.setSoundtrack("sounds/exhale.wav")
	// this.audioController.autoplay = true
	this.graphics = null;
	self.currentVideoElement = null;
	// placeholders for doing transition effectxs:
	var len = 4 * this.width * this.height
    var offset = new Array(len)
	var delta = new Array(len)
	this.junctionLoading = false;
	this.junctionStarted = false;
	this.branchPlaying = false;
	self.behavior = null;//{behavior_type : "splice", interval : "random", min : 500, max : 8000}
	self.currentBranchElement = null;

	// used to indicate how the next transition between videos
	// will appear:
	var transitionFlags = {
		// fade out on the old video and into the new
		fade : false,
		// superimpose old on top of the new
		overlap : false,
		beginTime : 0, // ms time (in old video) at start of the transition
		duration : 0, // number of ms the transition will last
		oldElement : undefined, // store the old video element
	};
	// for each switching schema there's one way to specify the roots
	// and another way to specify the loops
	this.RootBehaviors = {
		// splice will randomly cut back and forth between clips:
		splice : function(){
			// don't interfere if a branch is playing:
			if (self.branchPlaying) {
				return;
			}
			// start playing the first root if there's not a current video:
			if (!self.currentVideoElement){
				self.currentVideoElement = self.rootVideoElements[0];
				self.currentVideoElement.play();
			}
			// otherwise switch the current video for a root clip:
			else{
				self.switchToVideo(self.getRandomClip(self.rootVideoElements));
			}
			// indicate that a root video is playing:
			var rootPlaying=true;
			// wake up each interval to switch back and forth between videos until done:
			var wakeup = function(){
				// don't interfere if a branch is playing:
				if (self.branchPlaying) {
					return;
				}
				// if a root is playing switch to a loop:
				if (rootPlaying){
					self.switchToVideo(self.getRandomClip(self.loopVideoElements));
					rootPlaying = false;
				}
				// if a loop is playing switch to a root:
				else{
					self.switchToVideo(self.getRandomClip(self.rootVideoElements));
					rootPlaying = true;
				}
				// set the interval for the next wakeup:
				var interval = parseInt(self.behavior.interval);
				if (self.behavior.interval=="random")
					interval = getRandomInt(self.behavior.min, self.behavior.max);
				_.delay(wakeup, interval)
			}
			wakeup();
		},
		// endlessly repeat this clip:
		repeat : function(){
			// don't interfere if a branch is playing:
			if (self.branchPlaying) {
				return;
			}
			// switch to a random video:
			if (self.currentVideoElement){
				self.switchToVideo(self.getRandomClip(self.rootVideoElements));
			}
			// start the root if nothing playing:
			else{
				self.currentVideoElement = self.rootVideoElements[0];
				self.currentVideoElement.play();
			}
			// set the behavior to start when the current video ends:
			if (!self.currentVideoElement.jqueryElement.handlerSet){
				self.currentVideoElement.jqueryElement.handlerSet = true;
				self.currentVideoElement.jqueryElement.bind('ended', function(){
					self.playBehavior(ClientHandlers.LoopBehaviors, self.LoopBehaviors);
				});
			}
		},
		// play through this video and move to a new one:
		playthrough : function(destination){
			// don't interfere if a branch is playing:
			if (self.branchPlaying) {
				return;
			}
			// start playing the first root if no video is playing
			if (!self.currentVideoElement) {
				self.currentVideoElement = self.rootVideoElements[0];
				self.currentVideoElement.play();
			}
			// or switch the current video for a root clip:
			else {
				self.switchToVideo(self.getRandomClip(self.rootVideoElements));
			}
			// on end branch to the new one:
			self.currentVideoElement.jqueryElement.bind('ended', function(){
				// alert('sending playthrough query');
				// here is where it needs to play the next
				// if it hasn't been set to something else:
				if (self.behavior.behavior_type === 'playthrough'){
					// send signal to the server to load the next junction
					self.coreController.sendQuery({ query: 'playthrough' });
				}
			});
		},
	}

	// behaviors for the loop videos:
	this.LoopBehaviors = {
		// repeat the video over and over again:
		repeat : function(){
			// do nothing if a branch is playing:
			if (self.branchPlaying) {
				return;
			}
			self.switchToVideo(self.getRandomClip(self.loopVideoElements));
			if (!self.currentVideoElement.jqueryElement.handlerSet){
				self.currentVideoElement.jqueryElement.handlerSet = true;
				self.currentVideoElement.jqueryElement.bind('ended', function(){
					self.playBehavior(ClientHandlers.RootBehaviors, self.RootBehaviors);
				});
			}
		},
		// do I use these?
		splice : function(){
		},
		playthrough : function(){
		}
	}

	// try to get the current frame of the current video:
	this.getFrameCount = function(){
		return self.currentVideoElement.getFrameCount();
      //return (vid.currentTime * 24).toPrecision(6);
    }
    // get the file name of tehe current video:
    this.getVideoName = function(){
    	return self.currentVideoElement.getVideoName();
    }
    // detect if its dstill playing:
	this.isPlaying = function(){
		return !self.currentVideoElement.paused && !self.currentVideoElement.ended;
	};
	// get a random integer:
	function getRandomInt(min, max) {
    	return Math.floor(Math.random() * (max - min + 1)) + min;
	}

	// fire a behavior from a customer behavior set,
	// if not found fire one from a backup set of behaviors:
	this.playBehavior = function(behaviorSet, backupSet){
		// play a customer behavior if present`
		if (behaviorSet[self.behavior.behavior_type])
			behaviorSet[self.behavior.behavior_type](self);
		else
			backupSet[self.behavior.behavior_type]();
	}

	this.getRandomClip = function(set){
		var start = Math.floor(Math.random() * 1000);
		return set[start%set.length];
	};

	this.doTransitionFade = function(w,h){
		self.videoContext.clearRect(0,0, w,h);
		// draw the correct image:
		var expired = new Date().getTime() - transitionFlags.beginTime
		var progress = expired/transitionFlags.duration
		// if we're done:
		if (expired > transitionFlags.duration ){
			self.videoContext.globalAlpha = 1
			transitionFlags.fade=false;
			transitionFlags.oldElement.videoElement.pause()
			transitionFlags.oldElement = undefined
			self.videoContext.drawImage(self.currentVideoElement.videoElement,0,0,w,h);
		}
		// if we're less than halfway done fade it out:
		else if (progress < 0.5){
			// self.videoContext.drawImage(self.currentVideoElement.videoElement,0,0,w,h);
			self.videoContext.drawImage(transitionFlags.oldElement.videoElement,0,0,w,h);
			self.videoContext.globalAlpha = 1 - (progress*2)
		}
		// if we're more than halfway done start fading in:
		else{
			self.videoContext.drawImage(self.currentVideoElement.videoElement,0,0,w,h);
			self.videoContext.globalAlpha = progress
		}
	}

	// the overlap transition:
	this.doTransitionOverlap = function(w,h){
		self.videoContext.clearRect(0,0, w,h);
		// draw the correct image:
		var expired = new Date().getTime() - transitionFlags.beginTime
		var progress = expired/transitionFlags.duration
		// if we're done:
		if (expired > transitionFlags.duration ){
			self.videoContext.globalAlpha = 1
			transitionFlags.overlap=false;
			transitionFlags.oldElement.videoElement.pause()
			transitionFlags.oldElement = undefined
			self.videoContext.drawImage(self.currentVideoElement.videoElement,0,0,w,h);
		}
		else{
			self.videoContext.drawImage(self.currentVideoElement.videoElement,0,0,w,h);
	        var source = self.videoContext.getImageData(0, 0, this.width, this.height);
			self.videoContext.drawImage(transitionFlags.oldElement.videoElement,0,0,w,h);
	        var target = self.videoContext.getImageData(0, 0, this.width, this.height);
	        var result = self.videoContext.createImageData(this.width, this.height);
			for (var i = 0; i < len; i += 1) {
	            offset[i] = target.data[i];
	            delta[i] = source.data[i] - target.data[i];
	            result.data[i] = 255;
	        }
	    	r = result.data;
	    	var value = 0.5 + 0.5 * Math.sin(progress)
	    	for (i = 0; i < len; i += 4) {
		        r[i] = offset[i] + delta[i] * value
		        r[i + 1] = offset[i + 1] + delta[i + 1] * value
		        r[i + 2] = offset[i + 2] + delta[i + 2] * value
		    }
			self.videoContext.putImageData(result, 0, 0);
		}
    }

    // this needs to update at the right rate
    // this needs to sync up to bounding-box frames
    // this needs to show bounding box overlay if active
	this.draw = function(w,h) {
		if (!self.currentVideoElement) {
	   		setTimeout(self.draw,20,w,h);
			return;
		}
		if (transitionFlags.fade) {
			self.doTransitionFade(w,h);
		}
		else if (transitionFlags.overlap) {
			self.doTransitionOverlap(w,h);
		}
		else {
			self.videoContext.drawImage(self.currentVideoElement.videoElement,0,0,w,h);
		}
		// write the overlay stuff:
		self.videoContext.globalCompositeOperation = 'source-over'
		var prevAlpha = self.videoContext.globalAlpha
		self.videoContext.globalAlpha = 1;
		self.graphics.draw();
		self.videoContext.globalAlpha = prevAlpha;
		setTimeout(self.draw,15,w,h);
	}

	// transition from one video to another using the indicated transition type:
	this.switchToVideo = function(video, effect){
		console.log('-------------- switch to video' )
		console.log(video);
		console.log('--------------' )
		// if no effect switch video right away
		if (!effect){
			var oldElement = self.currentVideoElement;
			video.play();
			self.currentVideoElement = video;
			oldElement.videoElement.pause();
			return;
		}
		switch (effect.name){
			case 'fade':
				transitionFlags.fade = true;
				transitionFlags.oldElement = self.currentVideoElement
				transitionFlags.beginTime = new Date().getTime()
				transitionFlags.duration = effect.param1
				transitionFlags.blackoutPeriod = effect.param2 // i'll implement this later
				video.play()
				self.currentVideoElement = video;
			break;
			case 'overlap':
				transitionFlags.overlap = true;
				transitionFlags.oldElement = self.currentVideoElement
				transitionFlags.beginTime = new Date().getTime()
				transitionFlags.duration = effect.param1
				transitionFlags.blackoutPeriod = effect.param2 // i'll implement this later
				video.play()
				self.currentVideoElement = video;
			break;
		}
	}

	// erase the previous junction:
	self.clearPreviousJunction = function()	{
		function clearClip(clip){
			clip.clear();
			delete clip;
		}
		// todo: loop over the previus junctions actual list of FilmClips:
		_.each(self.rootVideoElements, clearClip)
		_.each(self.loopVideoElements, clearClip)
		_.each(self.otherVideoElements, clearClip)
		this.rootVideoElements = [];
		this.loopVideoElements = [];
		this.otherVideoElements = {};
	}

	this.loadJunction = function(junction, allDone, end) {
		this.clearPreviousJunction()
		self.currentJunction = junction;
		this.junctionLoading = true;
		this.junctionStarted = false;
		// load roots:
		async.auto({
			roots: function(rootsDone) {
        // load each of the root video elements:
				async.each(junction.roots, function(junctionRoot, done){
					// load the root video elements with a start event that doesn't do anything
					self.rootVideoElements.push(new FilmClip(junctionRoot, function(evt) {
					}, end));
          return done();
				}, function(){
					rootsDone();
				});
			},
			loops: function(loopsDone) {
        // load each of the loop elements:
				async.each(junction.loops, function(junctionLoop, done){
					// load the loop video elements with a start event that doesn't do anything:
					self.loopVideoElements.push(new FilmClip(junctionLoop, function(evt) {
					}, end));
          return done();
				}, function() {
					loopsDone();
				});
			}
		}, function(err, res) {
			allDone(err, res);
		});
		// load deaths:
		// for ( i = 0; i < _.keys(junction.others).length; i++){
		// 	//this.otherVideoElements[junction.others[i]] = new FilmClip(junction.deaths[i], begin, end);
		// }
	};

	// when we get a new junction:
	this.handleNewJunction = function(junction){
		self.behavior = junction.behavior
		self.currentJunction = junction.junction
		self.currentJunctionName = junction.junctionName;
		var started = false;
		async.auto({
			// load junction play elements:
			load: function(done) {
				self.loadJunction(self.currentJunction, function(){
					done();
				}, self.end);
			},
			// load junction graphical elements:
			graphics: ['load', function(results, done) {
				self.graphics.loadJunction(junction);
				done();
			}]
		}, function(err, result) {
			if (err) {
				alert(err)
			}
			self.junctionLoading = false;
			if (!started) {
				self.playBehavior(ClientHandlers.RootBehaviors, self.RootBehaviors);
				started = true;
			}
 		});
	}
	// branch to the same junction:
	this.branchToSame = function(bracket) {
		self.currentBranchElement = new FilmClip(bracket.branch, function(evt){
			self.branchPlaying = true;
			self.switchToVideo(self.currentBranchElement);
			self.currentBranchElement.play();
		}, function(){
			// branch to the same junction when this ends
			self.branchPlaying = false;
			self.playBehavior(ClientHandlers.RootBehaviors, self.RootBehaviors);
		});
		self.currentBranchElement.start();
	}
	//
	this.branchToRepeat = function(bracket) {
		self.currentBranchElement = new FilmClip(bracket.branch, function(){
	    // reset the current element to play this one:
	    self.currentVideoElement.videoElement.onended = function() {
	      self.branchPlaying = true;
	      self.switchToVideo(self.currentBranchElement, bracket.behavior.effect);
	      self.loadJunction(bracket.junction, function() {
				}, undefined);
	      self.graphics.loadJunction(bracket);
	    };
	  }, function(){
	    // branch to the junction when this ends
	    self.behavior = bracket.behavior
	    self.branchPlaying = false;
	    self.playBehavior(ClientHandlers.RootBehaviors, self.RootBehaviors);
	  });
		self.currentBranchElement.start();
	};
	// branch immediately:
	this.branchNow = function(bracket) {
		// short-circuiting branches will play instantly:
		self.currentBranchElement = new FilmClip(bracket.branch, function(evt) {
			self.branchPlaying = true;
			self.switchToVideo(self.currentBranchElement, bracket.behavior.effect);
			self.loadJunction(bracket.junction, function() {
				// alert("allDone branchNow junction loaded")
			}, undefined);
			self.graphics.loadJunction(bracket);
		}
		, function(){
			// branch to the junction when this ends
			self.behavior = bracket.behavior
			self.branchPlaying = false;
			self.playBehavior(ClientHandlers.RootBehaviors, self.RootBehaviors);
		});
		//self.currentBranchElement.start();
	};

	// when we play a branch:
	this.handleBranch = function(bracket){
		// if we're self-branching to the same junction:
		if (bracket.junctionName === self.currentJunctionName){
			return self.branchToSame(bracket);
    }
		if (self.currentBranchElement){
      self.currentBranchElement.clear();
    }
		// repeat branches will wait until the end of the current sequence:
		if (self.behavior.behavior_type==='repeat'){
			return self.branchToRepeat(bracket);
		}
		self.branchNow(bracket);
	}

	this.draw(videoCanvas.width,videoCanvas.height);
}

if (module) {
	module.exports = VideoChainer;
}
