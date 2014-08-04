var uartService = require('../src/drivers/uart.js')('/dev/ttyS1'); 

var uart = uartService.get({}, {});

uart.write(new Buffer([0, 1, 2, 3, 4]));

uart.on('data', function (data) {console.log('data:', data)})


/**
var SerialPort = require("serialport").SerialPort;
var serialPort = new SerialPort("/dev/ttyS1");

serialPort.on("open", function () {
  console.log('open');
  serialPort.on('data', function(data) {
    console.log('data received: ' + data);
  });
  serialPort.write("ls\n", function(err, results) {
    console.log('err ' + err);
    console.log('results ' + results);
    serialPort.close()
  });
});
**/
