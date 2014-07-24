var util = require('util'),
  EventEmitter = require('events').EventEmitter  

var PinDriver = require('node-cubieboard-gpio');

function Pin (pin) {
  this.pin = PinDriver[pin];
  PinDriver.init();
  this.interrupts = {};
  this.isPWM = false;

};

util.inherits(Pin, EventEmitter);

Pin.prototype.type = 'digital';

Pin.prototype.resolution = 1;

Pin.prototype.input = function () {
  this.rawDirection(false);
  return this;
};

Pin.prototype.output = function (value) {
  this.rawDirection(true);
  this.rawWrite(value);
  return this;
};

Pin.prototype.rawDirection = function (isOutput) {
  if (isOutput) {
    PinDriver.setcfg(this.pin, PinDriver.OUT); 
  } else {
    PinDriver.setcfg(this.pin, PinDriver.IN);
  }
}

Pin.prototype.write = function (value) {
  this.output(value);
  return null;
};

Pin.prototype.rawWrite = function (value) {
  if (value) {
    PinDriver.output(this.pin, PinDriver.HIGH); 
  } else {
    PinDriver.output(this.pin, PinDriver.LOW);
  }
}

Pin.prototype.read = function () {
  this.input();
  var value = this.rawRead(); 
  return value;
}

Pin.prototype.rawRead = function () {
  return PinDriver.input(this.pin);
}

/** Interrupts **/

function _triggerTypeForMode(mode) {

  switch(mode) {
    case "high":
    case "low" :
      return "level";
    case "rise":
    case "fall":
    case "change":
      return "edge";
    default:
      return;
  }
}

Pin.prototype.once = function (mode, callback) {
  var type = _triggerTypeForMode(mode);

  if (type) {

    _registerPinInterrupt(this, type, mode);

    this.__onceRegistered = true;
  }

  Pin.super_.prototype.once.call(this, mode, callback);
};



Pin.prototype.on = function(mode, callback) {

  var type = _triggerTypeForMode(mode);

  if (type === "level" && !this.__onceRegistered) {
    throw  new Error("You cannot use 'on' with level interrupts. You can only use 'once'.");
  }
  
  else {

    if (type && !this.__onceRegistered) {

      _registerPinInterrupt(this, type, mode);
    }

    this.__onceRegistered = false;

    Pin.super_.prototype.on.call(this, mode, callback);
  }
};

function _registerPinInterrupt (pin, type, mode) {
  
}

module.exports = Pin;
