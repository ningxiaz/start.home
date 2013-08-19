var random   = require('./random_data'),
	moment   = require('moment'),
	Firebase = require('firebase');

// forward the modules from random_data.js
module.exports.bootstrapFirebase  = random.bootstrapFirebase;
module.exports.randomSnapshot     = random.randomSnapshot;
module.exports.dateRange          = random.dateRange;
module.exports.pushRandomSnapshot = random.pushRandomSnapshot;

// real manager functions
module.exports.processSnapshots   = processSnapshots;

// clean data
// when a datum is added to snapshots/all, figure out which day it belongs to and update the day summary for it

function processSnapshots() {
	var fb = new Firebase('https://start-home.firebaseio.com/');

	var timer = moment();

	var checker = setInterval(function() {
		if (timer.isBefore(moment().subtract(10, 'seconds'))) {
			console.log("Listening to new snapshots.")
			clearInterval(checker);
		}
	}, 100)

	fb.child('snapshots/all').on('child_added', function (fbSnapshot) {
		// simple hack to avoid the initial wave of snapshots
		if (timer.isAfter(moment().subtract(10, 'seconds'))) return;

		var snapshot = fbSnapshot.val();

		var dayRef = fb.child('snapshots/daily/' + snapshotDate(snapshot));

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
	})
}

function snapshotDate(snapshot) {
	return moment(snapshot.timestamp).format('MM-DD-YYYY');
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