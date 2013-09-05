var random   = require('./random_data'),
	moment   = require('moment'),
	Firebase = require('firebase'),
	pj		 = require('prettyjson');

// This module should handle all the data management services on the backend
// including:
// - Getting snapshots from the house
// - Pushing snapshots to Firebase
// - Processing snapshots for daily summaries
// - Getting weather and meteorological data
// - Helper functions for testing (bootstrapping the firebase, random data)

// Using the module from the command line:
// m = require('./manager')
// m.processSnapshots()
// m.pushRandomSnapshot()
// etc...

// forward the modules from random_data.js
module.exports.bootstrapFirebase  = random.bootstrapFirebase;
module.exports.randomSnapshot     = random.randomSnapshot;
module.exports.dateRange          = random.dateRange;
module.exports.pushRandomSnapshot = random.pushRandomSnapshot;
module.exports.startSnapshots = random.startSnapshots;

// real manager functions
module.exports.processSnapshots   = processSnapshots;
module.exports.clearFirebase      = clearFirebase;

// careful with this!
function clearFirebase() {
	var fb = new Firebase('https://start-home.firebaseio.com/');
	fb.set({});
}

// process data 
// when a snapshot is added to snapshots/all, figure out which
// day it belongs to and update the day summary for it
function processSnapshots(processPrevious) {
	var fb = new Firebase('https://start-home.firebaseio.com/');

	var timer = moment();

	console.log("Starting the snapshot processor...")

	// var checker = setInterval(function() {
	// 	process.stdout.write(".")
	// 	if (timer.isBefore(moment().subtract(10, 'seconds'))) {
	// 		process.stdout.write("\n")
	// 		console.log("Listening to new snapshots.")
	// 		clearInterval(checker);
	// 	}
	// }, 1000)

	fb.child('snapshots/all').on('child_added', function (fbSnapshot) {

		var snapshot = fbSnapshot.val();
		
		// simple hack to disregard old snapshots (which are assumed to be processed...)
		if (!processPrevious && moment(snapshot.timestamp).isBefore(timer)) return;

		// console.log("Received snapshot:")
		// console.log(pj.render(snapshot))

		var dayRef  = fb.child('snapshots/daily/'  + snapshotDate(snapshot));
		var hourRef = fb.child('snapshots/hourly/' + snapshotHour(snapshot));

		dayRef.once('value', function(day) {
			day = day.val();

			// if the day isn't in the database yet, create it!
			if (!day) {
				day = newDay();
			}

			// calculate the new values
			var count = day.numSnapshots + 1;

			var	electric_total   = day.electric.total + snapshot.electric.total,
				electric_average = electric_total / count;

			var	water_total   = day.water.total + snapshot.water.total,
				water_average = water_total / count;

			// update the relevant fields
			dayRef.update({
				numSnapshots: count,
				electric: {
					total: electric_total,
					average: electric_average
				},
				water: {
					total: water_total,
					average: water_average
				}
			})
		})

		hourRef.once('value', function(hour) {
			hour = hour.val();

			// if the hour isn't in the database yet, create it!
			if (!hour) {
				hour = newHour();
			}

			// calculate the new values
			var count = hour.numSnapshots + 1;

			var	electric_total   = hour.electric.total + snapshot.electric.total,
				electric_average = electric_total / count;

			var	water_total   = hour.water.total + snapshot.water.total,
				water_average = water_total / count;

			// update the relevant fields
			hourRef.update({
				numSnapshots: count,
				electric: {
					total: electric_total,
					average: electric_average
				},
				water: {
					total: water_total,
					average: water_average
				},
				timestamp: moment(snapshot.timestamp).startOf('hour').format()
			})

			hourRef.setPriority(+moment(snapshot.timestamp).startOf('hour'))
		})
	})
}

function snapshotDate(snapshot) {
	return moment(snapshot.timestamp).format('MM-DD-YYYY');
}

function snapshotHour(snapshot) {
	return moment(snapshot.timestamp).startOf('hour').format('MM-DD-YYYY-HH');
}

function newDay() {
	return {
		numSnapshots: 0,
		electric: {
			total: 0,
			average: 0
		},
		water: {
			total: 0,
			average: 0
		}
	}
}

function newHour() {
	return {
		numSnapshots: 0,
		electric: {
			total: 0,
			average: 0
		},
		water: {
			total: 0,
			average: 0
		}
	}
}