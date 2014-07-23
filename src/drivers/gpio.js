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

module.exports = Pin;
