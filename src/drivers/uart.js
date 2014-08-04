var util = require('util'),
  EventEmitter = require('events').EventEmitter,
  Queue = require('sink_q')
 
var UARTDriver = require('serialport').SerialPort;
var queue = new Queue();

function UARTService (device) {
  var device = device;
  return {get: function (format, port) {
      return new UART (device, format, port);
    }
  }
}

function UART (device, params, port) {
  if (!params) params = {};
  this.device = device;
  this.uartPort = port;
  this.params = params;

  this.serial = new UARTDriver(device);
  //this.dataBits = propertySetWithDefault(params.dataBits, UARTDataBits, UARTDataBits.Eight);
  //this.parity = propertySetWithDefault(params.parity, UARTParity, UARTParity.None);
  //this.stopBits = propertySetWithDefault(params.stopBits, UARTStopBits, UARTStopBits.One);

  this.serial.on("open", function () {
    queue.ready();
  }.bind(this))

  this.serial.on("data", function (data) {
    this.emit("data", data) 
  }.bind(this))
}

util.inherits(UART, EventEmitter);
 
UART.prototype.on = function (mode, callback) {
  queue.push(function(callback) {
    UART.super_.prototype.on.call(this, mode, callback);
  }.bind(this), callback)
}

UART.prototype.setBaudRate = function (rate) {
  this.params.baudrate = rate;
};

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
  queue.push(function (callback) {
    this.serial.write(buf, callback);
  }.bind(this), function (err) {
    if (err) {
      console.log("Error:", err);
    };
  }.bind(this))
};

module.exports = UARTService; 
