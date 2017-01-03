const _ = require('underscore');
// const Text = require('./Text.js');
const Inventory = require('./Inventory.js');
const InventoryItem = Inventory.InventoryItem;
const InventoryButton = Inventory.InventoryButton;
const InventoryThumbnail = Inventory.InventoryThumbnail;
// should have 'style' embedded in the element
class OnscreenHTMLElement {
  constructor(module, graphics, coords, coreController, $) {
    this.module = module;
    this.coreController = coreController;
    this.position = coords.position;
    this.rotation = coords.rotation;
    this.width = 50;
    this.height = 50;
    // name to send when queried:
    this.name = graphics.name;
    this.draggable = graphics.draggable;
    this.element = $(graphics.element);
    if (graphics.style) {
      this.element.attr('style', graphics.style);
    }
    if (graphics.class) {
      this.element.attr('class', graphics.class);
    }
    if (graphics.changehandler) {
      this.element.bind('change keyup input', function(evt) {
        this.module[graphics.changehandler](evt, this);
      });
    }
    if (graphics.clickhandler) {
      this.element.bind('click', function(evt) {
        this.module[graphics.clickhandler](evt, this);
      });
    }
    if (graphics.draghandler) {
      this.element.bind('click', function(evt) {
        this.module[graphics.draghandler](evt, this);
      });
    }
  }
}

// container for all graphics facilities
class Graphics{
  constructor(module, graphicsCanvas, $) {
    this.module = module;
    this.videoChainer = null;
    // this.stage.addChild()
    this.graphicsContext = graphicsCanvas.getContext('2d');
    this.textChains = []
    this.inventoryImages= [];
    this.onscreenElements = {};
    // keep a ref to the main element:
    this.mainElement = $('#mainElement');
    this.addOnscreenElements = function(onscreenElement) {
      this.mainElement.append(onscreenElement.element);
      this.onscreenElements[onscreenElement.name] = onscreenElement;
    }
    this.clearOnscreenElements = function() {
      this.mainElement.empty();
      this.onscreenElements = {}
    }
    this.blackout = true;
    this.blackoutTimer = 24;
    this.selectedItem = undefined;

    // this.stage = new createjs.Stage('videoCanvas');
    //this.stage.autoClear = false;
    this.queryEnabled = false;

    // number inputs:
    this.numberInputs = [];
    this.inventory = [];
    this.inventoryButton = new InventoryButton();
    this.showScore = function(score, maxScore) {
      this.graphicsContext.font='20px Georgia';
      this.graphicsContext.fillText('You have ' + score + 'points out of ' + maxScore, 10,50);
    }
  }
  expandInventoryItem(item) {
    // get the big image for it
    this.inventoryImages.push(new InventoryItem(item.thumbnail))
  }

  showInventory(inventory) {
    this.selectedItem = undefined;
    this.inventory = inventory;
    let curX = width/2-(2.5*thumbWidth);
    let curY = 300;
    // show the exit icon:
    // this.inventoryImages +=
    for (let i = 0; i < inventory.length; i++) {
      if (i!==0 && i%5===0)
      curY += thumbHeight;
      this.inventoryImages.push(new InventoryThumbnail(this.inventory[i], { x:curX + ((i+1)%5) * thumbWidth, y:curY}, {width:thumbWidth, height: thumbHeight}));
    }
    // _.each(inventory, function(item, name) {
    // 	let img = new InventoryThumbnail(item, {x:curX, y:curY}, {width:thumbWidth, height: thumbHeight})
    // })
  }
  hideInventory() {
    this.inventoryImages= [];
  }
  showInventoryItem (inventory) {

  }

  handleClick(x,y) {
    let result = this.inventoryButton.handleClick(x,y)
    if (result) return result;
    for (let i = 0; i < this.textChains.length; i++) {
      let text = this.textChains[i].handleClick(x,y)
      if (text!=='') {
        return text;
      }
    }
    for (let i = 0; i < this.inventoryImages.length; i++) {
      let result = this.inventoryImages[i].handleClick(x,y)
      if (result) return result;
    }
  }

  loadScene(scene) {
    this.clearOnscreenElements();
    _.each(scene.graphics, function(graphic) {
      console.log(graphic);
      // todo: add any special message:
      if (graphic.element) {
        this.addOnscreenElements(new OnscreenHTMLElement(graphic, {
          position: { x:200, y:200 },
          rotation: 0
        }, this.coreController, $));
      }
      // if (graphic.text)
      // 	this.addTextChain(graphic.text, graphic.position, graphic.fadeOut)
    });
  }

  clearTextChains() {
    for (let i = 0; i < this.textChains.length; i++) {
      delete this.textChains[i];
    }
    this.textChains = []
  }

  addTextChain(text, position, fadeOut) {
    this.textChains.push(new TextChain(text,position,fadeOut))
  }

  selectItem(item) {
    // todo: make it swoop to the corner:
    item.selected = true;
    item.position.x = 10;
    item.position.y = 500;
    item.width = 50;
    item.height = 50;
    this.selectedItem = item;
    $('body').css({cursor: 'url(' + this.selectedItem.item.img + ')'});
  }
  unselectItem() {
    this.selectedItem.selected = false;
    // todo: make it swoop to the corner:
    this.selectedItem = undefined;
  }
  draw()	{
    // draw any selected item:
    if (this.selectedItem)
    this.selectedItem.draw(this.graphicsContext);
    // draw the inventory items:
    _.each(this.inventoryImages, function(img) {
      img.draw(this.graphicsContext);
    });
    if (this.inventoryImages.length===0)
    this.inventoryButton.draw(this.graphicsContext);
    // TWEEN.update();
    //  	this.graphicsContext.fillStyle = 'red';//'#d0d0d0';
    // this.graphicsContext.font = 'bold 50px TitleFont';
    // _.each(this.textChains, function(textItem) {
    // 		textItem.draw(this.graphicsContext);
    // });
  }
}
module.exports = Graphics;
