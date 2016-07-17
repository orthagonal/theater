var mongoose = require('mongoose');

var checkListSchema = {
	junctionName : String,
	bucket : String, // roots, loops, branches
	fileName : String, // name of the final output file
	status :	{
		blank : Boolean,
		placeholderGenerated : Boolean,
		placeholderGenerated : Boolean,
		shot : Boolean,
		edited : Boolean,
		sound : Boolean,
		finalized : Boolean,
	}
}
exports.CheckLists = mongoose.model('CheckLists',  new mongoose.Schema(checkListSchema));

var junctionGraphSchema = {
	junctions : [
		{
			name : String, // name of the junction
			core : {
				// list of root clips:
				roots : [{
					path : String, // path to the file
					name : String // name of this root clip
				}],
				// list of loop clips:
				loops : [{
					path : String, // path to the file
					name : String // name of this root clip
				}],
			},
			// list of branch buckets:
			branches : [
				{
					destinationName : String,
					// list of clips in this bucket:
					clips : [
						{
							path : String // path to the file
						}
					]

				}
			]
		}
	]
}

var directorSchema =
{
	hints : [
		{
			prompt : String, // the prompt from the client
			hints: [String]	 // one or more sentences for the hint
		}
	]
}

// var director = new mongoose.model('director', new mongoose.Schema(directorSchema))
// var junctionGraph = new mongoose.model('junctionGraph', new mongoose.Schema(junctionGraphSchema))
// var junction = new mongoose.model('junction', new mongoose.Schema(junctionSchema))

var Director = function()
{
	this.gameStream = null;
	this.Hint = function(query)
	{
		if (this.ProcessHint(query))
		{
		}
		else
		{
		}
	};

	this.ProcessHint = function(query)
	{

	};

	this.switchToVideo = function(video, gameState)
	{
		// todo: how does this switch us to new video in gamestream?
		// 1. add the video
		// 2. start streaming the video
		this.gameStream.switchClient();
	}

	this.getStartJunction = function()
	{
		return
		{
			JunctionGraph.FirstJunction
		}
	}
}
exports.Director = Director;
