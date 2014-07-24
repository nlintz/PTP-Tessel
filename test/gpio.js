var Pin = require('../src/drivers/gpio.js');

var pins = [];
for (var i=1; i<7; i++) {
  pins.push({name: "PD" + i, pin:new Pin("PD"+i)});
}

for (var i in pins) {
  var pin = pins[i];
  pin.pin.output().write(1);
  var high = pin.pin.input().read();

  pin.pin.output().write(0);
  var low = pin.pin.input().read();

  if (high != 1 || low != 0) {
    console.log("err", pin.name);
  }
}

