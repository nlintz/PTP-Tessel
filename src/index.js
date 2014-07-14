var SPI = require('pi-spi'),
    spi = SPI.initialize('/dev/spidev0.0'),
    i2c = require('i2c'),
    wire = new i2c(0x18, {device:'/dev/i2c-1'}),
    EventEmitter = require('events').EventEmitter,
    util = require('util')


function Pi_Tessel () {

}

Pi_Tessel.prototype.SPI = function (params) {
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
}

util.inherits(SPI, EventEmitter);

Pi_Tessel.prototype.SPI.transfer = function (txbuf, callback) {
  spi.transfer(txbuf, txbuf.length, function (e, d) {
    if (callback) {
      callback(e, d);
    }
  });
}

Pi_Tessel.prototype.SPI.send = function (txbuf, callback) {
 this.transfer(txbuf, callback); 
}

Pi_Tessel.prototype.SPI.receive = function (buf_len, callback) {
  var txbuf = new Buffer(buf_len);
  txbuf.fill(0);
  this.transfer(txbuf, callback);
}

Pi_Tessel.UART = function (params, port) {

}

Pi_Tessel.I2C = function (addr, mode, port) {

}


module.exports = new Pi_Tessel();
