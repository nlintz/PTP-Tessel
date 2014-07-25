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

function Interrupt(mode) {
  this.mode = mode;
};

var i =0;

Pin.prototype.once = function (mode, callback) {
  var type = _triggerTypeForMode(mode);

  if (type) {

    _registerPinInterrupt(this, type, mode);

    this.__onceRegistered = true;
  }

  Pin.super_.prototype.once.call(this, mode, callback);
};

Pin.prototype.on = function(mode, callback) {

  if (this.gpio.direction() != "in") {
    this.output();
  }

  var type = _triggerTypeForMode(mode);

  if (type === "level" && !this.__onceRegistered) {
    throw new Error("You cannot use 'on' with level interrupts. You can only use 'once'.");
  }

  // This is a valid event
  else {

    // If it is an edge trigger (and we didn't already register a level in 'once')
    if (type && !this.__onceRegistered) {

      // Register the pin with the firmware and our data structure
      _registerPinInterrupt(this, type, mode);
    }

    // Clear the once register
    this.__onceRegistered = false;

    // Add the event listener
    Pin.super_.prototype.on.call(this, mode, callback);
  }
};

Pin.prototype.removeListener = function (event, listener) {
  // Call the regular event emitter method
  var emitter = Pin.super_.prototype.removeListener.call(this, event, listener);

  // If it's an interrupt event, remove as necessary
  //_interruptRemovalCheck(event);

  return emitter;
};

function _setPinInterruptConditions (pin, edge) {
  pin.gpio.setDirection('in');
  pin.gpio.setEdge(edge);
}

function _registerPinInterrupt(pin, type, mode) {
// TODO CHECK FOR ALREADY REGISTERED INTERRUPTS

  if (type == "level") {
    var reading = (pin.read() == 1) ? "high" : "low";
    
    if (reading == mode) {
      setImmediate(function () {
        pin.emit(mode);
      })
      return;  
    }

    switch (mode) {
      case "high":
        _setPinInterruptConditions(pin, 'rising');
        break;
      case "low":
        _setPinInterruptConditions(pin, 'falling');
        break;
      default:
        return;
    }
  } 
  else if (type == "edge") {
    switch (mode) {
      case "rise":
        _setPinInterruptConditions(pin, 'rising');
        break;
      case "fall":
        _setPinInterruptConditions(pin, 'falling');
        break;
      case "change":
        _setPinInterruptConditions(pin, 'both');
        break;
      default:
        return;
    }
  }
  var pin = pin; // Bind pin instance with closure
  pin.gpio.watch(function (err, value) {
    if (pin.__onceRegistered) {
      pin.gpio.unwatch();
    }
    pin.emit(mode);
  })
}



module.exports = Pin;
