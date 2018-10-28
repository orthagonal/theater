var rq = app.project.renderQueue;
var masterComp = app.project.activeItem; 
var layers = masterComp.layers;
   // disable all layers:

// todo: generate loops and branches and assign name to items
// a loop wll be a clip and a reverse of that same clip
// a branch will be an outgoing clip and the forward clip+outgoing clip to handle transition from reverse
var exportList = [
    'forward_arm1',
    'arm1',
    'forward_arm2',
    'branch_to_front_of_box'
];

var rootDir = "C:/Documents/GitHub/theater/";

for (var b = 1; b <= masterComp.numLayers; ++b){
    // get a clean copy of the composition:
    var comp = masterComp.duplicate();
    var layers = comp.layers;
    var layer = layers[b];
    // enable only this layer:
    layer.enabled = true;
    layer.audioEnabled = true;
    var rangeIn;
    var rangeOut;
    // todo: may need to drop first/last frame to avoid darkness
    // time-reverse a layer:    
    var raccourci = layer.position;
    var keyValueOne = new Array();
    var keyValueTwo = new Array();
    var keyTimeOne;
    var keyTimeTwo;
    //layer.property("Position").addKey(layer.inPoint);
    //layer.property("Position").addKey(layer.outPoint);
    //keyValueOne = raccourci.keyValue(1);
    //keyValueTwo = raccourci.keyValue(2);
    //keyTimeOne = raccourci.keyTime(1);
    //keyTimeTwo = raccourci.keyTime(2);   
    //layer.property("Position").setValueAtTime(keyTimeOne,[keyValueTwo[0],keyValueTwo[1]]); 
    //layer.property("Position").setValueAtTime(keyTimeTwo,[keyValueOne[0],keyValueOne[1]]);
    //  var d = layer.outPoint - layer.inPoint;
    //layer.stretch = (layer.outPoint /d)*100;    
    if (layer.stretch > 0) {
        rangeIn = (layer.inPoint < 0) ? 0 : layer.inPoint;
        rangeOut = (layer.outPoint > comp.duration) ? comp.duration : layer.outPoint;
	} else {
        rangeIn = (layer.outPoint < 0) ? 0 : layer.outPoint;
        rangeOut = (layer.inPoint > comp.duration) ? comp.duration : layer.inPoint;
    }
    $.writeln("layer " + b + " " + layer.enabled + " start " + rangeIn + " end " + rangeOut);
    // Set to min size first, then resize -- to avoid problems setting range
    comp.workAreaStart = 0;
    comp.workAreaDuration = comp.frameDuration
    comp.workAreaStart = rangeIn
    if ((rangeOut - rangeIn - comp.frameDuration) > 0.0001) {	
      comp.workAreaDuration = parseInt((rangeOut - rangeIn) * 1000) / 1000;
    }
    // todo: get the layer names from a Scene descriptor:
    var renderItem = rq.items.add(comp);
    var om = renderItem.outputModule(1);
    om.file = new File(rootDir + "/forward" + b + ".mp4");
    renderItem.file = om.file;
    // disable this layer again so the next one can process:    
}
    try {
       rq.queueInAME(true); 
     } catch(exc) {
       $.writeln(exc);
     }