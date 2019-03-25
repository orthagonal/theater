// browserify-shader will load these in dev mode:
// otherwise in production mode do this:
// todo: maybe just put these in as strings?
const fs = require('fs');
const path = require('path');

class SwitcherShader {
  constructor(videoController, dimensions, devMode = true) {
    this.noShow = true;
    this.frameCount = 0;
    this.dimensions = dimensions;
    console.log('switcher dev mode is %s', devMode);
    this.partials = [undefined, undefined, undefined, undefined, undefined];
    this.partialVideos = [undefined, undefined, undefined, undefined, undefined];
    this.partialVideoReady = [false, false, false, false, false];
    this.partialVideoTransitioning = [false, false, false, false, false];
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
    this.requestAnimationFrame = this.videoController.theWindow.requestAnimationFrame.bind(this.videoController.theWindow);
    setTimeout(() => {
      this.videoController.theWindow.requestAnimationFrame(this.render.bind(this));
    }, 2500);
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

  // connect partial video to shader, partials are small videos
  // that lay over all or part of the main video:
  connectPartial(partial, index, isFirst) {
    // only update partial frames if the partial is transitioning,
    // so ready=true when onplaying a transitioning partial
    // then ready = false after first frame of the *next* video
    const gpuIndex = index + 3;
    this.partials[index] = partial;
    this.partialVideos[index] = partial.element;
    this.partialVideoReady[index] = false;
    this.partialVideoTransitioning[index] = false;
    if (isFirst) {
      partial.element.onplaying = () => {
        this.partialVideoTransitioning[index] = true;
      };
    } else {
      partial.element.onplaying = () => {
        this.partialVideoReady[index] = true;
      };
    }
    partial.element.play();
  }

  //////// event listeners:
  render(now) {
    // transitioning ones update every single frame
    this.frameCount = (this.frameCount + 1) % 6;
    if (this.partialVideoTransitioning[0]) {
      this.videoController.theWindow.createImageBitmap(this.partialVideos[0], { resizeWidth: 1920, resizeHeight: 1080, resizeQuality: 'high' }).then(image => {
        this.glWorker.postMessage({ image, partial: true, index: this.frameCount, gpuIndex: 3 }, [image]);
      });
    }
    if (this.partialVideoTransitioning[1]) {
      this.videoController.theWindow.createImageBitmap(this.partialVideos[1], { resizeWidth: 1920, resizeHeight: 1080, resizeQuality: 'high' }).then(image => {
        this.glWorker.postMessage({ image, partial: true, index: this.frameCount, gpuIndex: 4 }, [image]);
      });
    }
    if (this.partialVideoTransitioning[2]) {
      this.videoController.theWindow.createImageBitmap(this.partialVideos[2], { resizeWidth: 1920, resizeHeight: 1080, resizeQuality: 'high' }).then(image => {
        this.glWorker.postMessage({ image, partial: true, index: this.frameCount, gpuIndex: 5 }, [image]);
      });
    }
    if (this.partialVideoTransitioning[3]) {
      this.videoController.theWindow.createImageBitmap(this.partialVideos[3], { resizeWidth: 1920, resizeHeight: 1080, resizeQuality: 'high' }).then(image => {
        this.glWorker.postMessage({ image, partial: true, index: this.frameCount, gpuIndex: 6 }, [image]);
      });
    }
    if (this.partialVideoTransitioning[4]) {
      this.videoController.theWindow.createImageBitmap(this.partialVideos[4], { resizeWidth: 1920, resizeHeight: 1080, resizeQuality: 'high' }).then(image => {
        this.glWorker.postMessage({ image, partial: true, index: this.frameCount, gpuIndex: 7 }, [image]);
      });
    }
    if (this.partialVideoTransitioning[5]) {
      this.videoController.theWindow.createImageBitmap(this.partialVideos[5], { resizeWidth: 1920, resizeHeight: 1080, resizeQuality: 'high' }).then(image => {
        this.glWorker.postMessage({ image, partial: true, index: this.frameCount, gpuIndex: 8 }, [image]);
      });
    }
    // on first go-through do all of them:
    // if (this.allStarting) {
    //   for (let i = 0; i < 6; i++) {
    //     if (this.partialVideoReady[i]) {
    //       this.videoController.theWindow.createImageBitmap(this.partialVideos[i], { resizeWidth: 1920, resizeHeight: 1080, resizeQuality: 'high' }).then(image => {
    //         this.glWorker.postMessage({ image, partial: true, index: i, gpuIndex: i + 3 }, [image]);
    //       });
    //     }
    //   }
    // } else {
    // others only update once per 6
    if (this.partialVideoReady[this.frameCount] && !this.partialVideoTransitioning[this.frameCount]) {
      this.videoController.theWindow.createImageBitmap(this.partialVideos[this.frameCount], { resizeWidth: 1920, resizeHeight: 1080, resizeQuality: 'high' }).then(image => {
        this.glWorker.postMessage({ image, partial: true, index: this.frameCount, gpuIndex: this.frameCount + 3 }, [image]);
      });
    }
    if (this.mainVideoReady) {
      this.videoController.theWindow.createImageBitmap(this.mainVideo,
        { resizeWidth: 1920, resizeHeight: 1080, resizeQuality: 'high' }
      ).then(image => {
        this.glWorker.postMessage({ image, main: true, noShow: this.noShow }, [image]);
      });
    }
    this.requestAnimationFrame(this.render.bind(this));
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
