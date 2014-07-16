Pi_Tessel = require('../src/index.js');

var UART = Pi_Tessel.UART();
UART.write(new Buffer([0, 2, 4, 6, 8]))
