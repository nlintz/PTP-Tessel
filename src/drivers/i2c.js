var util = require('util'),
  EventEmitter = require('events').EventEmitter

var I2CDriver = require('i2c');

function I2CService (device) {
  var device = device;
  return {get: function (format, mode, port) {
      return new I2C (device, format, mode, port);
    }
  }
}

function I2C (device, addr, mode, port) {
  this.addr = addr;
  this.wire = new I2CDriver(this.addr, {device: device});
  this.mode = mode;
  this.port = port;
}

util.inherits(I2C, EventEmitter);

I2C.prototype.transfer = function (txbuf, rxbuf_len, callback) {
  if (txbuf.length > 1) {
    throw new Error("I2C Transfer txbuf must be == 1 byte");
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
  this.wire.readByte(function (err, res) {
    if (callback) {
      callback(err, res);
    }
  });
}

I2C.prototype.send = function (txbuf, callback) {
  if (txbuf.length > 1) {
    var cmd = txbuf.slice(0, 1)[0];
    var data = Array.prototype.slice.call(txbuf.slice(1, txbuf.length), 0);
    this.wire.writeBytes(cmd, data, function (err) {
      if (callback) {
        callback(err);
      }
    });
  } else {
    this.wire.writeByte(txbuf[0], function (err) {
      callback(err);
    })
  }
};

module.exports = I2CService;
