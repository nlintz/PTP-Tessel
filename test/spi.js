var Pi_Tessel = require('../src/index.js');

var spi = Pi_Tessel.SPI;
spi.transfer(new Buffer([0, 1, 2, 3, 4, 5]));
