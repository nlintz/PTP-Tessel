gpio = require("pi-gpio");
gpio.close(8);
gpio.open(8, 'output', function (err){
  gpio.write(8, 1);
  gpio.write(8, 0);  
})

