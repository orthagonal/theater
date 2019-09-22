class InterfaceController {
  constructor(controller, videoDirectory) {
    this.previousMask = undefined;
    this.controller = controller;
    this.dimensions = controller.dimensions;
    this.videoElement = undefined;
    this.hitboxCanvas = controller.hitboxCanvas;
    this.hitboxCanvasContext = this.hitboxCanvas.getContext('2d');
    this.checkRate = 50;
  }

  disconnectMask() {
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
    setTimeout(this.ping.bind(this), this.checkRate);
    return this.videoElement;
  }

  ping() {
    if (this.videoElement) {
      this.hitboxCanvasContext.drawImage(this.videoElement, 0, 0, this.dimensions.width, this.dimensions.height);
    }
    setTimeout(this.ping.bind(this), 1000 / 30);
  }

  click(mouseEvent) {
    // skip if branching:
    if (this.controller.branching) {
      return;
    }
    try {
      // get the pixel from the hitbox video at the mouse x,y position:
      // todo: can i save time by only drawing the 1 pixel at the mouse xy?
      this.hitboxCanvasContext.drawImage(this.videoElement, 0, 0, this.dimensions.width, this.dimensions.height);
      // The active game object can process the pixel code however it wants.
      // By convention if pixel[0] has a value of 255 it is considered a miss,
      // and any other value means the click occurred inside a coded region of the video:
      this.controller.activeObject.query(mouseEvent,
        this.hitboxCanvasContext.getImageData(mouseEvent.x, mouseEvent.y, 1, 1).data
      );
    } catch (e) {
      this.controller.activeObject.query(mouseEvent);
    }
  }
}

module.exports = InterfaceController;
