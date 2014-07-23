var Pin = require('../src/drivers/gpio.js');

var pin1 = new Pin("PD1");

pin1.output().write(1);
console.log(pin1.input().read());

pin1.output().write(0);
console.log(pin1.input().read());
