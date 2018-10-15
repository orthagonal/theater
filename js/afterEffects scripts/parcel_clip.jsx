var rq = app.project.renderQueue;
var masterComp = app.project.activeItem; 
var layers = masterComp.layers;
   // disable all layers:

var exportList = [
    'forward_arm1',
];
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
    comp.workAreaDuration = parseInt((rangeOut - rangeIn) * 1000) / 1000;
    // todo: get the layer names from a Scene descriptor:
    var renderItem = rq.items.add(comp);
    var om = renderItem.outputModule(1);
    om.file = new File("C:/thisis/temp" + b + ".mp4");
    renderItem.file = om.file;
    // disable this layer again so the next one can process:    
}
    try {
       rq.queueInAME(true); 
     } catch(exc) {
       $.writeln(exc);
     }