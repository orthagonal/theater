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
    this.a_position = gl.getAttribLocation(this.program, 'a_position');
    this.a_texCoord = gl.getAttribLocation(this.program, 'a_texCoord');
    this.v_texCoord = gl.getUniformLocation(this.program, 'v_texCoord');
    this.u_video0 = gl.getUniformLocation(this.program, 'u_video0');

    // shader variables

    // the default shader effect is null:
    this.u_activeEffect = gl.getUniformLocation(this.program, 'u_activeEffect');
    gl.uniform1f(this.u_activeEffect, global.NO_EFFECT);

    // set the u_resolution for the shader:
    this.u_resolution = gl.getUniformLocation(this.program, 'u_resolution');
    gl.uniform2fv(this.u_resolution, [dimensions.width, dimensions.height]);

    // allow effect requests to specify the start time of the request:
    this.u_effectStartTime = gl.getUniformLocation(this.program, 'u_effectStartTime');

    // make sure the current time is passed:
    this.u_currentTime = gl.getUniformLocation(this.program, 'u_currentTime');

    // pass the duration of the currently playing video:
    this.u_videoDuration = gl.getUniformLocation(this.program, 'u_videoDuration');

    // just pass the % done:
    this.u_percentDone = gl.getUniformLocation(this.program, 'u_percentDone');

    // the mouse:
    this.u_mouse = gl.getUniformLocation(this.program, 'u_mouse');

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

  // set the video to input to the non-active channel:
  connectVideo(element, onStart) {
    this.video0 = element;
    this.ready0 = false;
    element.addEventListener('playing', () => {
      this.ready0 = true;
    }, true);
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
    }
    this.currentTime = new Date().getTime();
    const elapsedTime = this.currentTime - this.effectStartTime;
    this.gl.uniform1f(this.u_currentTime, this.currentTime);
    this.gl.uniform1f(this.u_percentDone, elapsedTime / this.videoDuration);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
    requestAnimationFrame(this.render.bind(this));
  }

  // effects:
  mouseMiss(mouseEvent, effectStartTime, videoDuration) {
    // mouse miss turns off before video ends with setTimeout
    setTimeout(() => {
      this.gl.uniform1f(this.u_activeEffect, global.NO_EFFECT);
    }, videoDuration);
    this.gl.useProgram(this.program);
    this.gl.uniform1f(this.u_activeEffect, global.MOUSE_MISS_EFFECT);
    this.gl.uniform1f(this.u_percentDone, 0.0);
    this.gl.uniform1f(this.u_mouse, [mouseEvent.clientX, mouseEvent.clientY]);
    this.effectStartTime = effectStartTime;
    this.videoDuration = videoDuration;
  }
}

module.exports = SwitcherShader;
