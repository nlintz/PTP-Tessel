var util = require('util'),
  EventEmitter = require('events').EventEmitter

var SPIDriver = require('pi-spi');
var MAX_SPI_SPEED = {freq:125 * Math.pow(10, 6), divisor:65536 };
var MIN_SPI_SPEED = {freq:3.814 * Math.pow(10, 3), divisor:2};

Number.prototype.map = function ( in_min , in_max , out_min , out_max ) {
  return ( this - in_min ) * ( out_max - out_min ) / ( in_max - in_min ) + out_min;
}

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
    this.chipSelect.output().low();
  }
  console.log(this.chipSelect.read())
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
