var EventEmitter = require('events').EventEmitter,
    util = require('util'),
    uartService = require('./drivers/uart.js'),
    i2cService = require('./drivers/i2c.js'),
    spiService = require('./drivers/spi.js'),
    spi = spiService('/dev/spidev0.0'),
    Pin = require('./drivers/gpio.js')



function Port (id, digital, analog, pwm, i2c, uart)
{
  this.id = String(id);
  var self = this;
  this.digital = digital.slice();
  this.analog = [];
  this.pwm = pwm.slice();
  this.pin = {};
  var pinMap = {digital : {'G1': 0, 'G2': 1, 'G3': 2}};

  Object.keys(pinMap).forEach(function(type) {
    Object.keys(pinMap[type]).forEach(function(pinKey) {
      self.pin[pinKey] = self[type][pinMap[type][pinKey]];
        Object.defineProperty(self.pin, pinKey.toLowerCase(), {
        get: function () { return self.pin[pinKey]; }
      });
    });
  });

  this.I2C = function (addr, mode, port) {
    return i2c.get(addr, mode, port);
  };

  this.UART = function (format, port) {
    return uart.get(format, port);
  };
};

Port.prototype.SPI = function (format, port) {
  return spi.get(format);
};

Port.prototype.digitalWrite = function (n, val) {
  this.digital[n].write(val);
}

/** UNIMPLEMENTED METHODS
  Port.prototype.pinOutput
  Port.prototype.pwmFrequency
**/

function Tessel_S () {
  var self = this;

  if (Tessel_S.instance) {
    return Tessel_S.instance;
  } else {
    Tessel_S.instance = this;
  }

  this.ports =  {
    A: new Port('A', [new Pin("PD2"), new Pin("PD1"), new Pin("PD4")], [], [], i2cService("/dev/i2c-1"), uartService("ttyS1")),

    B: new Port('B', [new Pin("PD3"), new Pin("PD6"), new Pin("PD5")], [], [], i2cService("i2c-1"), uartService("ttyS2"))

  };


  this.port = function (label) {
    return board.ports[label.toUpperCase()];
  };
}

var board = module.exports = new Tessel_S();

for (var key in board.ports) {
    board.port[key] = board.ports[key];
}


util.inherits(Tessel_S, EventEmitter);
/** UNIMPLEMENTED METHODS
this.led
this.pin
this.interrupts
this.interruptsAvailable
this.button
this.sleep

**/
/**
function SPI (params) {
  params = params || {};
  if (typeof params.dataMode == 'number') {
    params.cpol = params.dataMode & 0x1;
    params.cpha = params.dataMode & 0x2;
  }
  this.cpol = params.cpol == 'high' || params.cpol == 1 ? 1 : 0;
  this.cpha = params.cpha == 'second' || params.cpha == 1 ? 1 : 0;

  // Speed of the clock
  this.clockSpeed = params.clockSpeed || 100000;
  this.frameMode = 'normal';
  this.role = params.role == 'slave' ? 'slave': 'master';
  //this.bitOrder = propertySetWithDefault(params.bitOrder, SPIBitOrder, SPIBitOrder.MSB);
  this.chipSelect = params.chipSelect || null;
};

util.inherits(SPI, EventEmitter);

SPI.prototype.transfer = function (txbuf, callback) {
  spi.transfer(txbuf, txbuf.length, function (e, d) {
    if (callback) {
      callback(e, d);
    }
  });
}

SPI.prototype.send = function (txbuf, callback) {
 this.transfer(txbuf, callback); 
}

SPI.prototype.receive = function (buf_len, callback) {
  var txbuf = new Buffer(buf_len);
  txbuf.fill(0);
  this.transfer(txbuf, callback);
}

function UART (params) {
  if (!params) params = {};
  this.params = params;
}

util.inherits(UART, EventEmitter);

UART.prototype._openUART = function (params) {
  return new SerialPort("/dev/ttyS1", params);
}

UART.prototype.setBaudRate = function (rate) {
  this.params.baudrate = rate;
}

UART.prototype.setDataBits = function (bits) {
  this.params.databits = bits;
}

UART.prototype.setStopBits = function (bits) {
  this.params.stopbits = bits;
}

UART.prototype.setParity = function (parity) {
  this.params.parity = parity;
}

UART.prototype.write = function (buf) { 
  var uart = this._openUART(this.params);
  uart.on("open", function () {
    uart.write(buf, function (err) {
      if (err) {
        console.log(err);
      };
      uart.close();
    });
  })
}

function I2C (addr) {
  this.addr = addr; 
  this.wire = new i2c(this.addr, {device:'/dev/i2c-1'});
};

util.inherits(I2C, EventEmitter);

I2C.prototype.transfer = function (txbuf, rxbuf_len, callback) {
  if (txbuf.length > 1) {
    throw new Error("I2C Transfer txbuf cannot be larger than 1 byte");  
  }
  
  this.wire.readBytes(txbuf[0], rxbuf_len, function (err, res) {
    if (err) {
      console.log(err);  
    } else {
      if (callback) {
        callback(err, res);
      }
    }
  })
}

I2C.prototype.receive = function (rxbuf_len, callback) {
 // this.wire.readBytes(this.addr, rxbuf_len, function (err, res) {
 this.wire.readByte(function (err, res) {
   if (callback) {
    callback(err, res);
   }
 })
};

I2C.prototype.send = function (txbuf, callback) {
  if (txbuf.length > 1) {
    var car = txbuf.slice(0, 1)[0];
    var cdr = Array.prototype.slice.call(txbuf.slice(1, txbuf.length), 0);
    this.wire.writeBytes(car, cdr, function (err) {
      if (callback) {
        callback(err);
      }
    });
  } else {
    this.wire.writeByte(txbuf[0], function (err){
      callback(err);
    })
  }
};

// Utils
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

function _errorRoutine(pin, error) {
  if (EventEmitter.listenerCount(pin, 'error')) {
    pin.emit('error', error);
  } else {
    throw error;
  }
}


function Pin (pin) {
  this.pin = pin;
  this.interrupts = {};
  this.isPWM = false;
}

util.inherits(Pin, EventEmitter);

Pin.prototype.type = 'digital';

Pin.prototype.resolution = 1;

Pin.prototype.input = function () {
  gpio.close(this.pin);
  gpio.open(this.pin, 'input');
  return this;
}

Pin.prototype.output = function (value) {
  value = value || 0;
  gpio.close(this.pin);
  gpio.open(this.pin, 'output', function (err) {
    if (err) {
      console.log(err);
    } else {
      gpio.write(this.pin, value);
    }
  }.bind(this));
  return this;
}

Pin.prototype.rawDirection = function (isOutput) {
  if (isOutput) {
    this.output();
  } else {
    this.input();
  }
  return this;
}

Pin.prototype.rawWrite = function (value) {
  gpio.write(this.pin, value);
  return this;
}

Pin.prototype.pwmDutyCycle = function (dutyCycleFloat) {

}

Pin.prototype.write = function (value) {
  this.rawWrite(value);
  this.rawDirection(true);

  return null;
}

Pin.prototype.rawRead = function () {
  return gpio.read(this.pin);
}

Pin.prototype.read = function () {
  this.rawRead();
  this.rawDirection(false);

  return null;
}

Pin.prototype.pull = function (mode) {
  gpio.close(this.pin);
  this.mode = mode;
  gpio.open(this.pin, mode);
  
}

Pin.prototype.mode = function () {
  return this.mode ? this.mode : "none";
}

Pin.prototype.on = function (mode, callback) {
  var type = _triggerTypeForMode(mode);

  if (type == "level" && !this.__onceRegistered) {
    _errorRoutine(this, new Error("You cannot use 'on' with level interrupts. You can only use 'once'.")); 
  } else {
    if (type && !this.__onceRegistered) {
      //_registerPinInterrupt(this, type, mode);  
    }
    
    this.__onceRegistered = false;
    Pin.super_.prototype.on.call(this, mode, callback);
  }
}

Pin.prototype.once = function (mode, callback) {
  var type = _triggerTypeForMode(mode);

  if (type) {
    //_registerPinInterrupt(this, type, mode);
    this.__onceRegistered = true;
  }

  Pin.super_.prototype.once.call(this, mode, callback);
  
}

Pin.prototype.removeListener = function (type, listener) {
  
}

Pin.prototype.removeAllListeners = function (type) {
  
}

function _getPins (pin_numbers) {
  var pins = [];
  for (var i = 0; i<pin_numbers.length; i++) {
    var pin = new Pin(pin_numbers[i]);
    pins.unshift(pin);
  }
  return pins;
};

function _digitalPins () {
  return _getPins([7, 11, 13, 15, 16, 18, 22]);
}

Tessel_S.prototype.digital = _digitalPins();

function _analogPins () {
  return [];
};

Tessel_S.prototype.analog = _analogPins();

function _pwmPins () {
  return _getPins([17]);
};

Tessel_S.prototype.pwm = _pwmPins();

Tessel_S.prototype.pin = function () {
  return [7, 11, 13, 15, 16, 17, 18, 22];
}

Tessel_S.prototype.SPI = function (params) {
  return new SPI(params);
};

Tessel_S.prototype.I2C = function (addr) {
  return new I2C(addr);  
};

Tessel_S.prototype.UART = function (params) {
 return new UART(params);
};
**/
