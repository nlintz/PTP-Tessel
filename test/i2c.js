var i2c = require('i2c');
var address = 0x3b;
var wire = new i2c(address, {device: '/dev/i2c-1'}); 

wire.writeByte(0x02, function(err) { 
  if (err) {
    console.log(err);
  }
});


