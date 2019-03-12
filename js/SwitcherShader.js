// browserify-shader will load these in dev mode:
// otherwise in production mode do this:
// todo: maybe just put these in as strings?
const fs = require('fs');
const path = require('path');

class SwitcherShader {
  constructor(videoController, gl, dimensions, devMode = true) {
    this.frameCount = 0;
    console.log('switcher dev mode is %s', devMode);
    this.gl = gl;
    this.goUp = true;
    this.videoController = videoController;
    this.partials = [undefined, undefined, undefined, undefined, undefined];
    let vertexShaderSource;
    let pixelShaderSource;
    if (devMode) {
      vertexShaderSource = require('./shaders/screen.vert');
      pixelShaderSource = require('./shaders/switcher.frag');
    } else {
      vertexShaderSource = () => fs.readFileSync(path.join(__dirname, 'shaders', 'screen.vert'), 'utf-8').toString();
      pixelShaderSource = () => fs.readFileSync(path.join(__dirname, 'shaders', 'switcher.frag'), 'utf-8').toString();
    }
    // set up the shader
    const program = this.program = gl.createProgram();
    const vertexShader = gl.createShader(gl.VERTEX_SHADER);
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

    this.defaultScreenCoordinates = [-1, 1, -1, -1, 1, -1, 1, 1];
    // setup the video elements and textures:
    this.mainVideo = undefined;
    this.mainVideoReady = false;
    this.mainVideoTexture = gl.createTexture();
    this.initTexture(this.mainVideoTexture);

    this.hitboxVideo = undefined;
    this.hitboxReady = false;
    this.hitboxVideoTexture = gl.createTexture();
    this.initTexture(this.hitboxVideoTexture);

    this.textImage = undefined;
    this.textReady = false;
    this.textTexture = gl.createTexture();
    this.initTexture(this.textTexture);

    this.gpuVars = [];
    this.partialVideos = [undefined, undefined, undefined, undefined, undefined];
    this.partialVideoReady = [false, false, false, false, false];
    this.partialVideoTextures = this.partialVideos.map(p => gl.createTexture());
    this.partialVideoTextures.forEach((p, index) => {
      this.initTexture(p);
      this.gpuVars.push(this.gl.getUniformLocation(this.program, `u_partialTexture${index}`));
    });

    this.inputVideos = [undefined, undefined, undefined];
    this.inputVideoReady = [false, false, false];
    this.inputVideoTextures = this.inputVideos.map(p => gl.createTexture());
    this.inputVideoTextures.forEach(p => this.initTexture(p));

    gl.viewport(0, 0, dimensions.width, dimensions.height);
    this.vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.defaultScreenCoordinates), gl.DYNAMIC_DRAW);
    this.partialVertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.partialVertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.defaultScreenCoordinates), gl.DYNAMIC_DRAW);

    this.textureBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.textureBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, 1, -1, -1, 1, -1, 1, 1]), gl.DYNAMIC_DRAW);

    this.a_position = gl.getAttribLocation(this.program, 'a_position');
    this.a_texCoord = gl.getAttribLocation(this.program, 'a_texCoord');
    this.v_texCoord = gl.getUniformLocation(this.program, 'v_texCoord');
    this.u_mainVideo = gl.getUniformLocation(this.program, 'u_mainVideo');
    this.u_hitboxVideo = gl.getUniformLocation(this.program, 'u_hitboxVideo');
    this.u_textTexture = gl.getUniformLocation(this.program, 'u_textTexture');
    this.u_isPartial = gl.getUniformLocation(this.program, 'u_isPartial');
    this.u_mainVideo = gl.getUniformLocation(this.program, 'u_mainVideo');

    // this.gl.uniform2fv(this.u_transLoc, [0.0, 0.0]);
    // this.gl.uniform1f(this.u_scaleLoc, 1.0);

    // shader variables
    // todo: change this to UBOs so groups of related uniforms can be set with 1 gl call:
    this.shaderVariables = {
      u_debugMode: { setter: 'uniform1f', default: 0.0 },
      u_mouse: { setter: 'uniform2fv' },
      u_partialCoords0: { setter: 'uniform2fv' },
      u_partialDims0: { setter: 'uniform2fv' },
      u_partialCoords1: { setter: 'uniform2fv' },
      u_partialDims1: { setter: 'uniform2fv' },
      u_partialCoords2: { setter: 'uniform2fv' },
      u_partialDims2: { setter: 'uniform2fv' },
      u_partialCoords3: { setter: 'uniform2fv' },
      u_partialDims3: { setter: 'uniform2fv' },
      u_partialCoords4: { setter: 'uniform2fv' },
      u_partialDims4: { setter: 'uniform2fv' },
      u_resolution: { setter: 'uniform2fv', default: [dimensions.width, dimensions.height] },
      u_scale: { setter: 'uniform2fv', default: [1.0, 1.0] },
      u_currentTime: { setter: 'uniform1f' },
      u_currentTimeV: { setter: 'uniform1f' },
      u_startTime: { setter: 'uniform1f' },
      u_percentDone: { setter: 'uniform1f' },
      u_activeEffect: { setter: 'uniform1f', default: global.NO_EFFECT },
      u_videoDuration: { setter: 'uniform1f' }
    };
    Object.keys(this.shaderVariables).forEach(varName => {
      const shaderInfo = this.shaderVariables[varName];
      this[varName] = gl.getUniformLocation(this.program, varName);
      if (shaderInfo.default) {
        this.setShaderVariable(varName, shaderInfo.default);
      }
    });
    // write a blue screen to start with:
    gl.enableVertexAttribArray(this.a_position);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.vertexAttribPointer(this.a_position, 2, gl.FLOAT, false, 0, 0);

    gl.enableVertexAttribArray(this.a_texCoord);
    gl.vertexAttribPointer(this.a_texCoord, 2, gl.FLOAT, false, 0, 0);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.useProgram(this.program);
    this.videoController.theWindow.requestAnimationFrame(this.render.bind(this));
  }

  deactivateEffect() {
    this.setShaderVariable('u_activeEffect', global.NO_EFFECT);
  }

  setShaderVariable(varName, value) {
    const shaderVarInfo = this.shaderVariables[varName];
    this.gl[shaderVarInfo.setter](this[varName], value || shaderVarInfo.default);
  }

  activateEffect(effectInfo) {
    this.effectStartTime = new Date().getTime();
    if (effectInfo.duration) {
      this.videoDuration = effectInfo.duration;
    }
    Object.keys(effectInfo).forEach(varName => {
      if (this.shaderVariables[varName]) {
        this.setShaderVariable(varName, effectInfo[varName]);
      }
    });
  }

  // bind each of mainVideo, video1 and branchVideo
  initTexture(texture) {
    const gl = this.gl;
    gl.bindTexture(gl.TEXTURE_2D, texture);
    // this needs to be set to correct dimensions:
    const pixel = new Uint8Array(1920 * 4 * 1080 * 4);//[255, 0, 0, 255]);  // opaque red
    console.log('doing the red');
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1920, 1080, 0, gl.RGBA, gl.UNSIGNED_BYTE, pixel);
    // gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, pixel);
    console.log('done red');
    // Turn off mips and set  wrapping to clamp to edge so it
    // will work regardless of the dimensions of the video.
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  }

  // set the video to input to the non-active channel:
  connectVideo(element, waitForIt) {
    this.mainVideo = element;
    // wait for next video to be ready, use for 'normal' behavior
    if (waitForIt) {
      this.mainVideoReady = false;
    }
    element.addEventListener('playing', () => {
      this.mainVideoReady = true;
    }, true);
  }

  // connect mask to shader:
  connectMask(element, waitForIt) {
    this.hitboxVideo = element;
    if (waitForIt) {
      this.hitboxVideoReady = false;
    }
    element.addEventListener('playing', () => {
      this.hitboxVideoReady = true;
    }, true);
  }

  // connect text to shader:
  connectText(canvas, textEffect) {
    // todo: set the text effect on the shader if specified
    this.textImage = canvas;
    this.textReady = true;
  }

  hideText() {
    this.textReady = false;
  }

  // add an input video to the mainVideo.  this will be used by
  // the main shader
  addInput(videoSource, name, textureIndex, coords) {
    const gl = this.gl;
    const inputVertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, inputVertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(coords), gl.DYNAMIC_DRAW);
    const videoUnit = gl.getUniformLocation(this.program, name);
    gl.uniform1i(videoUnit, textureIndex);
    const inputTexture = gl.createTexture();
    gl.activeTexture(gl[`TEXTURE${textureIndex}`]);
    gl.bindTexture(gl.TEXTURE_2D, inputTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, videoSource);
  }

  // connect partial video to shader, partials are small videos
  // that lay over all or part of the main video:
  connectPartial(partial, index, callbacks, partialIndex) {
    const gpuIndex = index + 3;
    const gpuTexture = this.gl[`TEXTURE${gpuIndex}`];
    this.partials[index] = partial;
    this.partialVideos[index] = partial.element;
    partial.element.ontimeupdate = () => {
      // do the copy here
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.partialVertexBuffer);
      this.gl.uniform1i(this.gpuVars[index], gpuIndex);
      this.gl.activeTexture(gpuTexture);
      this.gl.bindTexture(this.gl.TEXTURE_2D, this.partialVideoTextures[index]);
      this.gl.texSubImage2D(this.gl.TEXTURE_2D, 0, 0, 0, this.gl.RGBA, this.gl.UNSIGNED_BYTE, this.partialVideos[index]);
    };
    // partial.element.addEventListener('playing', () => {
    // }, true);
    partial.element.play();
  }

  //////// event listeners:
  render(now) {
    // this.frameCount++;
    // if (this.frameCount % 24 === 0) {
    //   console.log(`${this.frameCount} / ${now / 1000} = ${this.frameCount / (now / 1000)}`);
    // }
    const gl = this.gl;
    // this.gl.uniform1f(this.u_currentTime, this.currentTime);
    // if (this.goUp) {
    //   this.gl.uniform1f(this.u_percentDone, elapsedTime / this.videoDuration);
    // } else {
    //   this.gl.uniform1f(this.u_percentDone, 1.0 - (elapsedTime / this.videoDuration));
    // }
    // draw the main video frame last:
    if (this.mainVideoReady) {
      // add any text data:
      if (this.textReady) {
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        this.textUnit = gl.getUniformLocation(this.program, 'u_textTexture');
        this.gl.uniform1i(this.textUnit, 2);
        gl.activeTexture(gl.TEXTURE2);
        gl.bindTexture(gl.TEXTURE_2D, this.textTexture);
        gl.texSubImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.textImage);
      }
      // add the hitbox data stream, can be used for hitbox effects:
      if (this.hitboxVideoReady) {
        this.hitboxVideoUnit = gl.getUniformLocation(this.program, 'u_hitboxVideo');
        this.gl.uniform1i(this.hitboxVideoUnit, 1);
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, this.hitboxVideoTexture);
        gl.texSubImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.hitboxVideo);
      }
      gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
      gl.uniform1i(this.u_mainVideo, 0);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, this.mainVideoTexture);
      gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, gl.RGBA, gl.UNSIGNED_BYTE, this.mainVideo);
      gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
    }
    // may need to do something here
    this.videoController.theWindow.requestAnimationFrame(this.render.bind(this));
  }

  // effects:
  mouseMiss(mouseEvent, effectStartTime, videoDuration) {
    // mouse miss turns off before video ends with setTimeout
    setTimeout(() => {
      this.gl.uniform1f(this.u_activeEffect, global.NO_EFFECT);
    }, videoDuration);
    this.gl.useProgram(this.program);
    this.gl.uniform1f(this.u_activeEffect, global.MOUSE_FLARE_EFFECT);
    this.gl.uniform1f(this.u_percentDone, 0.0);
    this.gl.uniform2fv(this.u_mouse, [mouseEvent.clientX * 1.0, mouseEvent.clientY]);
    this.effectStartTime = effectStartTime;
    this.videoDuration = videoDuration;
  }
}

module.exports = SwitcherShader;
