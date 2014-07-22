Pi_Tessel = require('../src/index.js');

var i2c = Pi_Tessel.I2C(0x40);

i2c.send(new Buffer([0x80, 0x01]), function (err){
  if (err)
    console.log(err);
});

i2c.receive(function(err, response){})

i2c.transfer(new Buffer([0x11]), 1, function(err, response){});
