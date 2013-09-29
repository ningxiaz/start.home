var Firebase = require('firebase'),
    moment = require('moment'),
    request = require('request'),
    async = require('async'),
    pj = require('prettyjson');

var base_url = 'http://localhost',
    port = 5000;

var time_format = 'h:mm a';

var time_trends = dateRange(moment().startOf('day'), moment().endOf('day'))
    .map(function(d, i) {
        return {
            time: d.format(time_format),
            weight: Math.sin(Math.PI * (i/40) - 2)
        }
    })

function rand(min, max) {
    return Math.random() * (max - min) + min;
}

function dateRange(start, end) {
    start = moment(start).startOf('day')

    var range = [];

    start = start.clone();

    var count = moment.duration(end - start).asMinutes() / 10; 

    for (var i = 0; i <= count; i++) {
        range.push(start.clone());
        start.add(10, 'm');
    };

    return range;
}

function randomSnapshot(config, timestamp) {
    var time_trend;

    time_trends.forEach(function(d) {
        if (d.time == moment(timestamp).format(time_format)) time_trend = d;
    })

    console.log(time_trend)
}

// This resets the firebase and sets it up for testing
// Use it when you want a clean slate
function bootstrapFirebase() {
    var fb = new Firebase('https://start-home.firebaseio.com/');

    var dates = dateRange(moment().subtract(40, 'd'), moment());

    // Make sure we have the config!
    getConfig(function(config) {
        var controls = config.controls,
            monitors = config.monitors;


    })
}

function pushRandomSnapshot() {
    var fb = new Firebase('https://start-home.firebaseio.com/');

    fb.child('snapshots/all').limit(1).once('value', function(fbSnap) {
        var key = Object.keys(fbSnap.val())[0];
        var snapshot = randomSnapshot(fbSnap.val()[key], moment());
        fb.child('snapshots/all').push().setWithPriority(snapshot, +moment(snapshot.timestamp));
    })
}

function startSnapshots() {
    var now = moment(),
        nextTenMinute = now.clone().startOf('hour');

    while(nextTenMinute.isBefore(now)) nextTenMinute.add(10, 'minutes');

    var delay = nextTenMinute - now;

    console.log("Waiting " + 
                moment.duration(delay).asSeconds() + 
                " seconds until " + 
                nextTenMinute.format("h:mm a") +
                " to start pushing snapshots.");

    setTimeout(start, delay);

    var interval;

    function start() {
        interval = setInterval(pushRandomSnapshot, 600000);
    }

    function stop() {
        clearInterval(interval);
    }

    return {
        stop: stop
    }
}

// From routes/index.js
function getConfig(callback) {
    async.parallel({
        controls: function(callback) {
            request(getUrl('/controls'), function(error, response, body) {
                callback(null, JSON.parse(body));
            })
        },
        monitors: function(callback) {
            request(getUrl('/monitors'), function(error, response, body) {
                callback(null, JSON.parse(body));
            })
        }
    }, function(err, results) {
        response = {
            controls: results.controls,
            monitors: results.monitors
        }

        callback(response)
    })
}

function getUrl(endpoint) {
    return url.resolve(base_url + ':' + port, endpoint)
}

module.exports.bootstrapFirebase = bootstrapFirebase;
module.exports.randomSnapshot = randomSnapshot;
module.exports.dateRange = dateRange;
module.exports.pushRandomSnapshot = pushRandomSnapshot;
module.exports.startSnapshots = startSnapshots;
