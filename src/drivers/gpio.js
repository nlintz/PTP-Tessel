var util = require('util'),
  EventEmitter = require('events').EventEmitter  

var PinDriver = require('tm-onoff').Gpio;

function Pin (pin) {
  this.pin = pin;
  this.gpio= new PinDriver(pin);
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
    this.gpio.setDirection('out');
  } else {
    this.gpio.setDirection('in');
  }
}

Pin.prototype.write = function (value) {
  this.output(value);
  return null;
};

Pin.prototype.high = function () {
  this.output(true);
  return this;
}

Pin.prototype.low = function () {
  this.output(false);
  return this;
}

Pin.prototype.rawWrite = function (value) {
  if (this.gpio.direction() == "in") {
    this.output(value);  
    this.input();
  } else {
    if (value) {
      this.gpio.writeSync(1); 
    } else {
      this.gpio.writeSync(0);
    }
  }
}

Pin.prototype.read = function () {
  this.input();
  var value = this.rawRead(); 
  return value;
}

Pin.prototype.rawRead = function () {
  return this.gpio.readSync();
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
 console.log('registering interrupt'); 
}

module.exports = Pin;
