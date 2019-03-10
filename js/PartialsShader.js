/*
partials thread needs to:
-set up initial GL texture stuff
- respond to calls from requestAnimationFrame to draw the array
-
*/
let glWorker;
class GLWorker {
  constructor(data) {
    this.canvas = data.canvas;
    this.gl = this.canvas.getContext('webgl');
    this.index = data.index;
    console.log('constructed instance %s', data.index);
    this.video = undefined;
    this.videoTexture = gl.createTexture();
    this.initTexture(this.mainVideoTexture);
  }

  render(now) {
  }

  loadTexture(image, now) {

  }

const onmessage = function (e) {
  // render:
  if (e.data.bitmap) {
    // new render loop is:
    // 1.copy image to correct texture index
    // 2.drawArrays only if told to
    console.log(`worker ${glWorker.index} rendering`);
    // glWorker.render(e.data.);
    if (e.data.runShader) {
      //
    }
    return;
  }
  // otherwise init:
  glWorker = new GLWorker(e.data);
};
