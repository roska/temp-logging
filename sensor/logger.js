#!/usr/bin/node
// Dependencies
var fs = require('fs');
var dateformat = require('dateformat');
var mysql = require('mysql');

// Variables
var filepath = '/sys/bus/w1/devices/'; // Place where sensors are located on the raspberry


// API service
var api = require('./api.js');

/*
 * Database connection pool
 *
 * Database connection definition
 * ------------------------------
 *
 * node-mysql documentation:
 * https://github.com/mysqljs/mysql#pooling-connections
 */
var pool = mysql.createPool({
	host		: '127.0.0.1',
	user		: 'root',
	password	: '',
	database	: 'home'
});

/*
 * Sensor array
 * ------------
 * The program loops through all sensors defined in this array.
 * Sensor data is located in `/sys/bus/w1/devices/<sensor-id/w1_slave`-file
 */
var sensors = [
	{ 'id': '28-0316471d2aff' }
]; // List of temp sensor id's. Format sensor: { 'id': '28-12fe39f3', 'name': 'living-room-1' }

/*
 * loopSensors()
 *
 * Loop over the sensor array to get temperature data and write it to database
 * ---------------------------------------------------------------------------
 */
function loopSensors(sensors) {
	for (var i = 0; i < sensors.length; i++) {
		var sensor = sensors[i];

		parseTemp(sensor.id, filepath);
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
	var file = fs.readFile(filepath + sensor +'/w1_slave', 'utf-8', function (err, data) {
		if (err) {
			console.log('Error reading file for sensor ' + sensor);
			// better error handling...
		} else {
			data = data.split('\n'); // Split sensor data file per line

			// Temperature data is the last 5 characters of the file's second row
			var stop = data[1].length;
			var start = stop - 5;
			var temp = data[1].substring(start, stop) / 1000; // Divide by 1000 to get value in correct format

			console.log('temperature: '+temp);

			logTemp(temp);
		}

	});
}


/*
 * logTemp()
 *
 * Write temperature data and timestamp into the database
 * ------------------------------------------------------
 */
function logTemp(temp) {
	var timestamp = getTimestamp();

	//
	api.logTemp(temp, timestamp);

	// Write stuff to database...
	pool.getConnection(function(err, connection) {
		if (err) {
			console.log('Couldnt connect to database');
		}

		connection.query('INSERT INTO temp (id, temp, timestamp) VALUES (null, '+ temp +', "'+ timestamp +'");', function(err, rows) {
			if (err) {
				// log error...
				console.log('Error writing data to database');
			} else {
				console.log('Writing to database succesful!');
			}

			connection.release();
		});
	});
	// Match sensor by it's id(serialnumber?) in the database (not table id)
}


/*
 * getTimestamp()
 *
 * Get the current timestamp in 'yyyy-mm-dd hh:MM:ss'-format
 * ---------------------------------------------------------
 */
function getTimestamp() {
	return dateformat(new Date(), "yyyy-mm-dd hh:MM:ss");
}

// run the main loop
loopSensors(sensors);
