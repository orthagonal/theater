class SwitcherShader {
  constructor(videoController, gl, dimensions) {
    this.gl = gl;
    this.videoController = videoController;

    // currently active video element:
    this.video0 = undefined;
    this.ready0 = false;
    // video channel 0
    this.videoTexture0 = gl.createTexture();
    this.initTexture(gl, this.videoTexture0);

    this.video1 = undefined;
    this.ready1 = false;
    // video channel 1
    this.videoTexture1 = gl.createTexture();
    this.initTexture(gl, this.videoTexture1);

    this.branchVideo = undefined;
    // video channel 1
    this.branchVideo = gl.createTexture();
    this.initTexture(gl, this.branchVideo);

    this.activeChannel = 0.0;

    // the main output video texture
    this.mainVideoTexture = gl.createTexture();
    this.initTexture(gl, this.mainVideoTexture);

    requestAnimationFrame(this.render.bind(this));
  }

  initTexture(gl, texture) {
    gl.bindTexture(gl.TEXTURE_2D, texture);
    const pixel = new Uint8Array([0, 0, 255, 255]);  // opaque blue
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, pixel);

    // Turn off mips and set  wrapping to clamp to edge so it
    // will work regardless of the dimensions of the video.
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  }

  //////// API methods:
  // set the video to input to the non-active channel:
  connectVideo(element) {
    if (this.activeChannel === 0.0) {
      this.video0 = element;
    } else {
      this.video1 = element;
    }
    element.addEventListener('playing', () => {
      // playing = true;
      // checkReady();
    }, true);
  }

  // switch to display the specified video or the non-active video
  switchUserVideo(channel) {
    this.activeChannel = channel || (this.activeChannel === 0.0 ? 1.0 : 0.0);
  }

  // set the video to input to the branch channel:
  connectBranch(element) {
    this.branchVideo = element;
  }

  // switch to display the branch video:
  showBranch() {
    this.activeChannel = 2.0;
  }

  //////// event listeners:
  render(now) {
    if (this.video0) {
      this.gl.bindTexture(this.gl.TEXTURE_2D, this.videoTexture0);
      this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, this.video0);
      this.gl.bindTexture(this.gl.TEXTURE_2D, this.videoTexture1);
      this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, this.video1);
    }
    requestAnimationFrame(this.render.bind(this));
  }

}

module.exports = SwitcherShader;
