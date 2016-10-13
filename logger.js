// Dependencies
var fs = require('fs');
var dateformat = require('dateformat');
var mysql = require('mysql');

// Variables
var filepath = '/sys/bus/w1/devices/'; // Place where sensors are located on the raspberry

// Format	sensor: { 'id': '28-12fe39f3', 'name': 'living-room-1' }
var sensors = []; // List of temp sensor id's

// Database definition

/*
 * loopSensors()
 *
 * Loop over the sensor array to get temperature data and write it to database
 * ---------------------------------------------------------------------------
 */
function loopSensors(sensors) {
	for (var i = 0; i < sensors.length; i++) {
		var sensor = sensors[i];

		var temp = parseTemp(sensor, filepath);
		var timestamp = dateformat(new Date(), "yyyy-mm-dd hh:MM:ss");

		logTemp(temp, timestamp);
	}
}


/*
 * parseTemp()
 *
 * Parse temperature data of the sensor from the raspberry pi filesystem
 * ---------------------------------------------------------------------
 */
function parseTemp(sensor, filepath) {

	// Read sensor data from the file in the raspberry pi
	var file = fs.readFile(filepath + sensor +'/w1_slave', function (err, data) {
		if (err) {
			console.log('Error reading file for sensor ' + sensor;
			// better error handling...
		} else {
			// Split text data per lines
			data = data.split('\n');

			// Temp data is the 5 last characters at the end of line 2
			// and needs to be divided by 100 to get the correct value
			var temp = data[1].splice(data[1].length, -5) / 100;

			return temp;
		}

	});
}


/*
 * logTemp()
 *
 * Write temperature data and timestamp into the database
 * ------------------------------------------------------
 */
function logTemp(temp, timestamp) {
	// Write stuff to database...

	// Match sensor by it's id(serialnumber?) in the database (not table id)
}

