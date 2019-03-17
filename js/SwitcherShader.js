// browserify-shader will load these in dev mode:
// otherwise in production mode do this:
// todo: maybe just put these in as strings?
const fs = require('fs');
const path = require('path');

class SwitcherShader {
  constructor(videoController, dimensions, devMode = true) {
    this.frameCount = 0;
    this.dimensions = dimensions;
    console.log('switcher dev mode is %s', devMode);
    this.partials = [undefined, undefined, undefined, undefined, undefined];
    this.partialVideos = [undefined, undefined, undefined, undefined, undefined];
    this.partialVideoReady = [false, false, false, false, false];
    let vertexShaderSource;
    let pixelShaderSource;
    if (devMode) {
      vertexShaderSource = require('./shaders/screen.vert')();
      pixelShaderSource = require('./shaders/switcher.frag')();
    } else {
      vertexShaderSource = fs.readFileSync(path.join(__dirname, 'shaders', 'screen.vert'), 'utf-8').toString();
      pixelShaderSource = fs.readFileSync(path.join(__dirname, 'shaders', 'switcher.frag'), 'utf-8').toString();
    }
    this.goUp = true;
    this.videoController = videoController;
    this.offscreenCanvas1 = videoController.controller.finalDestinationCanvas.transferControlToOffscreen();
    this.glWorker = new videoController.controller.theWindow.Worker('./js/PartialsShader.js');
    this.glWorker.postMessage({ canvas: this.offscreenCanvas1, init: true, devMode, vertexShaderSource, pixelShaderSource, dimensions }, [this.offscreenCanvas1]);
    // should this be delayed?
    this.videoController.theWindow.requestAnimationFrame(this.render.bind(this));
  }

  deactivateEffect() {
    this.setShaderVariable('u_activeEffect', global.NO_EFFECT);
  }

  setShaderVariable(varName, value) {
    this.glWorker.postMessage({ setShaderVariable: true, varName, value });
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

  // set the video to input to the non-active channel:
  connectVideo(element, waitForIt) {
    this.mainVideo = element;
    // wait for next video to be ready, use for 'normal' behavior
    if (waitForIt) {
      this.mainVideoReady = false;
    }
    element.onplaying = () => {
    //   element.ontimeupdate = () => {
        // this.videoController.theWindow.createImageBitmap(element, 0, 0, 1920, 1080).then(image => {
        //   this.glWorker.postMessage({ image, main: true }, [image]);
        // });
    //   };
      this.mainVideoReady = true;
    };
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

  // is this still here?
  // add an input video to the mainVideo.  this will be used by
  // the main shader
  // addInput(videoSource, name, textureIndex, coords) {
  //   const gl = this.gl;
  //   const inputVertexBuffer = gl.createBuffer();
  //   gl.bindBuffer(gl.ARRAY_BUFFER, inputVertexBuffer);
  //   gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(coords), gl.DYNAMIC_DRAW);
  //   const videoUnit = gl.getUniformLocation(this.program, name);
  //   gl.uniform1i(videoUnit, textureIndex);
  //   const inputTexture = gl.createTexture();
  //   gl.activeTexture(gl[`TEXTURE${textureIndex}`]);
  //   gl.bindTexture(gl.TEXTURE_2D, inputTexture);
  //   gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, videoSource);
  // }

  // connect partial video to shader, partials are small videos
  // that lay over all or part of the main video:
  connectPartial(partial, index, callbacks, partialIndex) {
    const gpuIndex = index + 3;
    this.partials[index] = partial;
    this.partialVideos[index] = partial.element;
    this.partialVideoReady[index] = false;
    partial.element.onplaying = () => {
      this.partialVideoReady[index] = true;
    };
    // partial.element.ontimeupdate = () => {
    //   this.videoController.theWindow.createImageBitmap(partial.element, 0, 0, 1920, 1080).then(image => {
    //     this.glWorker.postMessage({ image, partial: true, index, gpuIndex }, [image]);
    //   });
    // };
    partial.element.play();
  }

  //////// event listeners:
  render(now) {
    this.frameCount++;
    // if (this.frameCount % 24 === 0) {
    //   console.log(`${this.frameCount} / ${now / 1000} = ${this.frameCount / (now / 1000)}`);
    // }
    if (this.partialVideoReady[0] && this.frameCount % 5 === 0) {
      this.videoController.theWindow.createImageBitmap(this.partialVideos[0], 0, 0, 1920, 1080).then(image => {
        this.glWorker.postMessage({ image, partial: true, index: 0, gpuIndex: 3 }, [image]);
      });
    }
    if (this.partialVideoReady[1] && this.frameCount % 6 === 0) {
      this.videoController.theWindow.createImageBitmap(this.partialVideos[1], 0, 0, 1920, 1080).then(image => {
        this.glWorker.postMessage({ image, partial: true, index: 1, gpuIndex: 4 }, [image]);
      });
    }
    if (this.partialVideoReady[2] && this.frameCount % 7 === 0) {
      this.videoController.theWindow.createImageBitmap(this.partialVideos[2], 0, 0, 1920, 1080).then(image => {
        this.glWorker.postMessage({ image, partial: true, index: 2, gpuIndex: 5 }, [image]);
      });
    }
    if (this.partialVideoReady[3] && this.frameCount % 8 === 0) {
      this.videoController.theWindow.createImageBitmap(this.partialVideos[3], 0, 0, 1920, 1080).then(image => {
        this.glWorker.postMessage({ image, partial: true, index: 3, gpuIndex: 6 }, [image]);
      });
    }
    if (this.partialVideoReady[4] && this.frameCount % 9 === 0) {
      this.videoController.theWindow.createImageBitmap(this.partialVideos[4], 0, 0, 1920, 1080).then(image => {
        this.glWorker.postMessage({ image, partial: true, index: 4, gpuIndex: 7 }, [image]);
      });
    }

    if (this.mainVideoReady) {
      this.videoController.theWindow.createImageBitmap(this.mainVideo, 0, 0, 1920, 1080).then(image => {
        this.glWorker.postMessage({ image, main: true }, [image]);
      });
    }
    // this.glWorker.postMessage({ render: now });
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
