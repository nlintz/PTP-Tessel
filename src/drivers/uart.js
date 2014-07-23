var util = require('util'),
  EventEmitter = require('events').EventEmitter
 
var UARTDriver = require('serialport').SerialPort;


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
  this.baudrate = (params.baudrate ? params.baudrate : 9600);
  //this.dataBits = propertySetWithDefault(params.dataBits, UARTDataBits, UARTDataBits.Eight);
  //this.parity = propertySetWithDefault(params.parity, UARTParity, UARTParity.None);
  //this.stopBits = propertySetWithDefault(params.stopBits, UARTStopBits, UARTStopBits.One);

  process.on('uart-receive', function (port, data) {
    if (port === this.uartPort) {
      this.emit('data', data);
    }
  }.bind(this))
}

util.inherits(UART, EventEmitter);
 
UART.prototype._openUART = function (params) {
  return new UARTDriver(this.device, params);
};

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
  var uart = this._openUART(this.params);
  uart.on("open", function () {
    uart.write(buf, function (err) {
      if (err) {
        console.log(err);
      };
      uart.close();
    });
  })
};

module.exports = UARTService;
  
