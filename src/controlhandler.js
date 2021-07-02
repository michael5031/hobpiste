export class Controlhandler {
  constructor() {
    this.initialize();
  }
  initialize() {
    document.addEventListener("keydown", (e) => {
      this.onKeyPress(e, "down");
    });

    document.addEventListener("keyup", (e) => {
      this.onKeyPress(e, "up");
    });
    //key is the keycode of the key pressed and value true for button is currently pressed and false for button is not pressed
    this.pressedKeys = new Map();
  }
  onKeyPress(key, what) {
    if (key.repeat != undefined) {
      if (key.repeat == true) return;
    }
    let k = key.keyCode;
    this.pressedKeys.set(k, what === "down" ? true : false);
  }

  isKeyPressed(key) {
    let result = this.pressedKeys.get(key);
    if (result == undefined || result == null) {
      result = false;
    }
    return result;
  }
}
