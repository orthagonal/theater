const pixels = require('image-pixels');

const getImageDataFaster = (x, y, w, h, W, H, d) => {
	var arr = new Uint32Array(w*h), i=0;
	for (var r=y; r<h+y; r+=1) {
		for (var c=x; c<w+x; c+=1) {
			var O = ((r*W) + c);
			if (c<0 || c>=W || r<0 || r>=H) {
				arr[i++] = 0;
			} else {
				arr[i++] = d[O];
			}
		}
	}
	return arr;
};

class InterfaceController {
  constructor(controller, videoDirectory) {
    this.previousMask = undefined;
    this.controller = controller;
    this.dimensions = controller.dimensions;
    this.videoElement = undefined;
    this.hitboxCanvas = controller.hitboxCanvas;
    this.hitboxCanvasContext = this.hitboxCanvas.getContext('2d');
    // const offscreenCanvas = this.hitboxCanvas.transferControlToOffscreen();
    this.checkRate = 50;
    this.currentMouseEvent = false;
    this.buffer = false;
		this.hasMask = false;
  }

  disconnectMask() {
		this.hasMask = false;
    this.videoElement.stop();
  }

  connectMask(maskPath) {
    this.videoElement = this.controller.$('<video />', {
      src: maskPath,
      type: 'video/mp4'
    })[0];
    this.videoElement.play();
    this.videoElement.width = this.dimensions.width;
    this.videoElement.height = this.dimensions.height;
		this.hasMask = true;
    // setTimeout(this.ping.bind(this), this.checkRate);
    return this.videoElement;
  }

  ping() {
    // if (this.videoElement) {
    //   this.hitboxCanvasContext.drawImage(this.videoElement, 0, 0, this.dimensions.width, this.dimensions.height);
    // }
    // setTimeout(this.ping.bind(this), 1000 / 30);
  }

  click(mouseEvent) {
    // skip if branching:
		if (this.controller.branching) {
			return;
		}
		let data = [0,0,0,0];
    this.currentMouseEvent = mouseEvent;
		// you might need to figure this part out it breaks ask you transition between mask/no mask
		// hence the try/catch
		if (this.hasMask) {
			try {
				this.hitboxCanvasContext.drawImage(this.videoElement,
		      mouseEvent.x, mouseEvent.y,
		      1,1,
		      mouseEvent.x, mouseEvent.y,
		      1,1
		    );
		    const t1 = new Date();
		    data = this.hitboxCanvasContext.getImageData(mouseEvent.x, mouseEvent.y, 1, 1).data;
		    const t2 = new Date();
		    console.log(`pixel took ${t2-t1}ms`);
			} catch (e) {
				console.log('no mask, just chill');
			}
		}
		this.controller.activeObject.query(mouseEvent, data);
  }
}

module.exports = InterfaceController;
