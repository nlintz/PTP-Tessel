i2cService = require('../src/drivers/i2c.js')('/dev/i2c-1'); 

var i2c = i2cService.get(0x40); 
i2c.transfer(new Buffer([0x11]), 1, function (err, res) {
  console.log(err, res);  
});
