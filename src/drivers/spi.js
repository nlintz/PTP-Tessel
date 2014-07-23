var util = require('util'),
  EventEmitter = require('events').EventEmitter

var SPIDriver = require('pi-spi');

function SpiService (device) {
  var device = device;
  return {get: function (format, port) {
      return new SPI (device, format);
    }
  }
}

function SPI (device, params) {
  this.spi = SPIDriver.initialize(device);

  params = params || {};
  if (typeof params.dataMode == 'number') {
    params.cpol = params.dataMode & 0x1;
    params.cpha = params.dataMode & 0x2;
    this.spi.dataMode(params.dataMode);
  }
  this.cpol = params.cpol == 'high' || params.cpol == 1 ? 1 : 0;
  this.cpha = params.cpha == 'second' || params.cpha == 1 ? 1 : 0;

  this.clockSpeed = params.clockSpeed || 100000;
  this.spi.clockSpeed(this.clockSpeed);

  this.frameMode = 'normal';
  this.role = params.role == 'slave' ? 'slave': 'master';
  this.chipSelect = params.chipSelect || null;
  
  if (this.chipSelect) {
    this.chipSelect.output().high()
  }
};

util.inherits(SPI, EventEmitter);

SPI.prototype.transfer = function (txbuf, callback) {
  if (this.chipSelect) {
    this.chipSelect.output.low();
  }
  this.spi.transfer(txbuf, txbuf.length, function (e, d) {
    if (this.chipSelect) {
      this.chipSelect.output().high()
    }
    if (callback) {
      callback(e, d);
    }
  }.bind(this));
};

SPI.prototype.send = function (txbuf, callback) {
  this.transfer(txbuf, callback);
};

SPI.prototype.receive = function (buf_len, callback) {
  var txbuf = new Buffer(buf_len);
  txbuf.fill(0);
  this.transfer(txbuf, callback);
}

module.exports = SpiService;
