// browserify-shader will load these in dev mode:
const vertexShaderSource = require('./shaders/screen.vert');
const pixelShaderSource = require('./shaders/switcher.frag');

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

    const program = this.program = gl.createProgram();

    const vertexShader = gl.createShader(gl.VERTEX_SHADER)
    gl.shaderSource(vertexShader, vertexShaderSource());
    gl.compileShader(vertexShader);
    gl.attachShader(program, vertexShader);

    const pixelShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(pixelShader, pixelShaderSource());
    gl.compileShader(pixelShader);
    gl.attachShader(program, pixelShader);

    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(program));
      return null;
    }
    gl.useProgram(program);
    gl.viewport(0, 0, dimensions.width, dimensions.height);
    this.vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, 1, -1, -1, 1, -1, 1, 1]), gl.STATIC_DRAW);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0, 1, 0, 0, 1, 0, 1, 1]), gl.STATIC_DRAW);
    this.a_position = gl.getAttribLocation(this.program, 'a_position');
    this.a_texCoord = gl.getAttribLocation(this.program, 'a_texCoord');
    this.v_texCoord = gl.getUniformLocation(this.program, 'v_texCoord');
    this.u_video0 = gl.getUniformLocation(this.program, 'u_video0');
    this.u_video1 = gl.getUniformLocation(this.program, 'u_video1');

    // set the u_resolution for the shader:
    this.u_resolution = gl.getUniformLocation(this.program, 'u_resolution');
    gl.uniform2fv(this.u_resolution, [dimensions.width * 1.0, dimensions.height * 1.0]);

    // active channel:
    this.u_activeChannel = this.gl.getUniformLocation(this.program, 'u_activeChannel');

    gl.enableVertexAttribArray(this.a_position);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);

    gl.vertexAttribPointer(this.a_position, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(this.a_texCoord);

    gl.vertexAttribPointer(this.a_texCoord, 2, gl.FLOAT, false, 0, 0);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
    requestAnimationFrame(this.render.bind(this));
  }

  // bind each of video0, video1 and branchVideo
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
  connectVideo(element, onStart) {
    if (this.activeChannel === 0.0) {
      this.video0 = element;
      this.ready0 = false;
      element.addEventListener('playing', () => {
        this.ready0 = true;
      }, true);
    } else {
      this.video1 = element;
      this.ready1 = false;
      element.addEventListener('playing', () => {
        this.ready1 = true;
      }, true);
    }
  }

  // switch to display the specified video or the non-active video
  switchUserVideo(channel) {
    this.gl.useProgram(this.program);
    this.activeChannel = channel || (this.activeChannel === 0.0 ? 1.0 : 0.0);
    this.u_activeChannel = this.gl.getUniformLocation(this.program, 'u_activeChannel');
    this.gl.uniform1f(this.u_activeChannel, this.activeChannel * 1.0);
    console.log(this.u_activeChannel)
    console.log(this.activeChannel)
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
    const gl = this.gl;
    gl.clearColor(0.0, 0.0, 0.0, 1.0);  // Clear to black, fully opaque
    gl.clearDepth(1.0);                 // Clear everything
    gl.enable(gl.DEPTH_TEST);           // Enable depth testing
    gl.depthFunc(gl.LEQUAL);            // Near things obscure far things
    // Clear the canvas before we start drawing on it.
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    if (this.ready0) {
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, this.videoTexture0);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.video0);
      // gl.uniform1i(this.u_video0, 0);
    }
    if (this.ready1) {
      // gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, this.videoTexture1);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.video1);
      // gl.uniform1i(this.u_video1, 1);
    }
    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
    requestAnimationFrame(this.render.bind(this));
  }
}

module.exports = SwitcherShader;
