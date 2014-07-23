var uartService = require('../src/drivers/uart.js')('/dev/ttyS1'); 

var uart = uartService.get();

uart.write(new Buffer([0, 1, 2, 3, 4]));
