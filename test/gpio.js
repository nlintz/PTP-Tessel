var Pin = require('../src/drivers/gpio.js');

/**
var pins = [];
for (var i=1; i<2; i++) {
  pins.push({name: 10, pin:new Pin(10)});
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
**/

var inputPin = new Pin(11);
inputPin.output().rawWrite('high')
inputPin.output().rawWrite('low')
/**
var outputPin = new Pin(28);
inputPin.on('change', function () {
  console.log('triggered properly');
})

outputPin.output().write(0)
outputPin.output().write(1)
outputPin.output().write(0)
outputPin.output().write(1)
**/
