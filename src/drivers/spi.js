var util = require('util'),
  EventEmitter = require('events').EventEmitter,
  Queue = require('sync-queue'),
  async = require('async')

var queue = new Queue();
var SPIDriver = require('pi-spi');
var SPIOptions = require('spi');

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
  // TODO Include params for datamode, framemode and add setters
  params = params || {};
  if (typeof params.mode == 'number') {
    params.cpol = params.mode & 0x1;
    params.cpha = params.mode & 0x2;
    //this.spi.dataMode(params.cpol | params.cpha);
    // this.spi.dataMode(0)
  }

  this.clockSpeed = params.clockSpeed || 100000;

  this.frameMode = 'normal';
  this.role = params.role == 'slave' ? 'slave': 'master';
  this.chipSelect = params.chipSelect || null;
  
  if (this.chipSelect) {
    this.chipSelect.output().high()
  }

  var spiSettings = new SPIOptions.Spi('/dev/spidev0.0');
  spiSettings.maxSpeed(this.clockSpeed);
  spiSettings.open(); spiSettings.close();

  this.spi = SPIDriver.initialize(device);
};

util.inherits(SPI, EventEmitter);

SPI.prototype._promiseTransfer = function (byteToTransfer) {
  var deferred = Q.defer();
  console.log('transfering', byteToTransfer)
  this.spi.transfer(byteToTransfer, 1, function(err, rx) {
    if (err) {
      deferred.reject(new Error("Spi Transfer Failed"));
    } else {
      deferred.resolve(rx);
    }
  })
  return deferred.promise;
}

SPI.prototype._transferByte = function(byteToTransfer) {
  return function (callback) {
    this.spi.transfer(byteToTransfer, 1, function(err, rx) {
      callback(null, rx);
    })
  }.bind(this);
}

SPI.prototype.transfer = function (txbuf, callback) {
  queue.place(function(){
    if (this.chipSelect) {
      this.chipSelect.output().low();
    }
    var proms = [];
    for (var i = 0; i<txbuf.length; i++) {
      proms.push(this._transferByte(new Buffer([txbuf[i]])));
    }
    async.series(proms, function (err, rx) {
      if (this.chipSelect) {
        this.chipSelect.output().high();
      }
      if (callback) {
        callback(err, Buffer.concat(rx));
      }
      queue.next();
    }.bind(this))
  }.bind(this))
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
