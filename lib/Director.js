class Director {
	constructor() {
		this.gameStream = null;
		this.queryProcessors = {};
	}
	Hint(query){
		if (this.ProcessHint(query)){
		}
		else{
		}
	}

	ProcessHint(query){
	};

	switchToVideo(video, gameState){
		// todo: how does this switch us to new video in gamestream?
		// 1. add the video
		// 2. start streaming the video
		this.gameStream.switchClient();
	}
}

module.exports = Director;
