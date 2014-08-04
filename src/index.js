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

  //this.led = [new Pin(4), new Pin(18), new Pin(16), new Pin(6)];

  if (Tessel_S.instance) {
    return Tessel_S.instance;
  } else {
    Tessel_S.instance = this;
  }

  this.ports =  {
    A: new Port('A', [new Pin(30), new Pin(28), new Pin(42), new Pin(11)], [], [], i2cService("/dev/i2c-1"), uartService("/dev/ttyS1")),

    B: new Port('B', [new Pin(31), new Pin(29), new Pin(43), new Pin(10)], [], [], i2cService("/dev/i2c-1"), uartService("/dev/ttyS2"))

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
