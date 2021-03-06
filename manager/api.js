var Firebase = require('firebase'),
	moment   = require('moment'),
	request  = require('request'),
	url      = require('url'),
	pj		 = require('prettyjson'),
	async    = require('async'),
	config   = require('../config');

module.exports.startInterface  = startInterface;

var control_list, monitor_list;

function startInterface() {

	var fb = new Firebase(config.FIREBASE_URL);

	// get the initial configuration for the controls and monitors
	async.parallel({
		controls: function(callback) {
			request(getUrl('/controls/'), function(error, response, body) {
				callback(null, body);
			})
		},
		monitors: function(callback) {
			request(getUrl('/monitors/'), function(error, response, body) {
				callback(null, body);
			})
		}
	}, function(err, results) {
		control_list = results.controls
		monitor_list = results.monitors

		console.log(control_list)

		fb.child('controls').set(control_list)
		fb.child('monitors').set(monitor_list)

		// pushSnapshot()
	})

	// // whenever a control changes in Firebase, send an API request to the house
	fb.child('controls/list').on('child_changed', function(snapshot, prevName) {
		request({
			method: 'PUT',
			uri: getUrl('/controls/' + snapshot.val().slug),
			form: {
				level: snapshot.val().value
			}
		})
	})

	// ping the server for updated controls and monitors
	setInterval(function() {
		async.parallel({
			controls: function(callback) {
				request(getUrl('/controls/'), function(error, response, body) {
					callback(error, JSON.parse(body));
				})
			},
			monitors: function(callback) {
				request(getUrl('/monitors/'), function(error, response, body) {
					callback(error, JSON.parse(body));
				})
			},
			climate: function(callback) {
				request(getUrl('/climate/'), function(error, response, body) {
					callback(error, JSON.parse(body));
				})
			}
		}, function(err, results) {
			if (err) return;

			fb.child('controls').update(results.controls)
			fb.child('monitors').update(results.monitors)
			fb.child('climate').update(results.climate)
		})
	}, config.API_POLLING_INTERVAL)



	// var now = moment(),
 //        nextTenMinute = now.clone().startOf('hour');

 //    while(nextTenMinute.isBefore(now)) nextTenMinute.add(10, 'minutes');

 //    var delay = nextTenMinute - now;

 //    console.log("Waiting " + 
 //                moment.duration(delay).asSeconds() + 
 //                " seconds until " + 
 //                nextTenMinute.format("h:mm a") +
 //                " to start pushing snapshots.");

 //    setTimeout(start, delay);

 //    var interval;

 //    function start() {
 //        interval = setInterval(pushSnapshot, 600000);
 //    }

 //    function stop() {
 //        clearInterval(interval);
 //    }

 //    return {
 //        stop: stop
 //    }
}

function pushSnapshot() {
	async.parallel({
		monitors: function(callback) {
			getMonitorPoints(callback)
		},
		controls: function(callback) {
			getControlPoints(callback)
		},
	}, function(err, results) {
		var snapshot = {
			monitors: {},
			controls: {},
			electric: {},
			water: {},
			climate: {
				indoor: {},
				outdoor: {}
			},
			timestamp: moment().format()
		}

		results.monitors.list.forEach(function(monitor) {
			snapshot['monitors'][monitor.slug] = monitor.value;
		})

		results.controls.list.forEach(function(control) {
			snapshot['controls'][control.slug] = control.value;
		})
	})
}

function getMonitorPoints(callback) {
	request(getUrl('/monitors/'), function(error, response, body) {
		callback(null, JSON.parse(body));
	})
}

function getControlPoints(callback) {
	request(getUrl('/controls/'), function(error, response, body) {
		callback(null, JSON.parse(body));
	})
}

function getUrl(endpoint) {
	return url.resolve(config.API_URL + ':' + config.API_PORT, endpoint)
}