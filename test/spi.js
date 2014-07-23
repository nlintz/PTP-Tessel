var spiService = require('../src/drivers/spi.js')('/dev/spidev0.0');
var spi = spiService.get();

spi.transfer(new Buffer([0, 1, 2, 3, 4, 5]));
spi.receive(5, function(data){});
spi.send(new Buffer([0, 1, 2, 3, 4, 5]), function(err,data){})

