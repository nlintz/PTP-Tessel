PTP-Client
==========

Client for the Portable Tessel Platform. This client allows you to run tessel modules on various other platforms such as the cubieboard and the raspberry pi. 

###Installation
```sh
npm install --save ptp-tessel
```

or include ptp-tessel in your package.json dependencies

```js
  ...
  "dependencies": {
    "ptp-tessel": "*",
    ...
  }
```

###Uninstallation
```sh
npm -g rm ptp-tessel
```

###Overview
####Low Level - Drivers
PTP implements SPI, UART, I2C, and GPIO in order to match the Tessel API. To run these protocols, we use the following drivers specified in package.json

* pi-spi and spi: SPI driver
* i2c: I2C driver
* serialport: UART driver
* tm-onoff: GPIO driver

Each of these libraries are wrapped by a service which can be found in src/drivers

####High Level - Services
To improve portability on different platforms, device drivers are wrapped in a service object which are easy to swap in and out of code. SPI, UART, and I2C follow the same service pattern which is as follows:

* exports <drivername>Service which takes in a device e.g. /dev/i2c-1
* service objects are factories which return an object that has a get() method to access the device driver wrapper.
* THe device driver wrapper object implements all methods from the matching driver on a tessel port object. For example, tessel.port.spi implements a transfer method which should be implemented in the device wrapper object.

####Connecting Everything
The services which expose different drivers to the Tessel are connected in src/index.js. Any board specific configuration should be detected using the getHardwareRevision() method. For example, if you need to use different gpio pin numbers or device names e.g. "/dev/ttyS1" vs "/dev/ttyAMA0", setup this configuration by adding a new field to BOARD_PORTS and change getHardwareRevision to support the new board.

###Todos

####Tests
Right now there are no test cases which is going to make future development a challenge. In the test directory is some code snippets which you can uncomment and run to make sure things look fine on a logic analyser. However, these tests should be removed in favor of legit unit tests.

Tests cases should be written using the [ttt](https://www.npmjs.org/package/ttt) library to maintain compatibility with Tessel proper.

####Beaglebone
The PTP hasn't been tested on the Beaglebone or Beaglebone Black. It should have no compatability issues but it would be great to have a documented source of someone getting it to work on a BBB.

####Unsupported Modules
Below are Tessel modules which aren't currently supported on PTP as well as reasons why they aren't supported.

| Module        | Reason         
| ------------- |:-------------:|
| MicroSD       | Most boards have a microSD slot|
| Camera        | USB cameras are easier to use and most boards dont permit SPI slave                |
| Audio         | Most boards have an audio jack|


####Driver Issues
The RaspberryPi has documented issues with I2C, namely sending repeated start packets. We are working on getting a solution to this problem, but if you are having trouble connecting to I2C Tessel modules, this is the likely culprit. There is a [C library](http://www.airspayce.com/mikem/bcm2835/) which supports repeated start I2C. Once we create a js binding for this C library, repeated start will be supported and modules should work fine.

####Hardware Add Ons
We need hardware adapter boards for different boards that break out pins to match the Tessel module ports. There are Eagle files for an addon board for the Raspberry Pi which can be found [here](https://github.com/nlintz/ptp-raspi-hw-addon).

####Fixing implementations
There are still some issues in the spi and i2c driver namely unimplemented methods and hardcoded parameters. Most of these problems are labelled with a TODO in the source code so they should be easy to hunt down and fix. Check the driver against the equivalent Tessel driver to make sure that all methods are implemented.