var Firebase = require('firebase'),
    moment = require('moment'),
    request = require('request'),
    async = require('async'),
    c = require('../config');

function rand(min, max) {
    return Math.random() * (max - min) + min;
}

var time_format = 'h:mm a';

function snapshotRange(start, end) {
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

var time_trends = snapshotRange(moment().startOf('day'), moment().endOf('day'))
    .map(function(d, i) {
        return {
            hour: d.format('HH'),
            minute: d.format('mm'),
            weight: Math.sin(Math.PI * (i/40) - 2)
        }
    })

function searchTrends(time) {
    var hour = moment(time).format('HH'),
        minute = moment(time).format('mm');

    var response = time_trends[0];


    time_trends.forEach(function(d) {
        if (diff(hour, d.hour) < diff(hour, response.hour)) {
            response = d;
            if (diff(minute, d.minute) < diff(minute, response.minute)) {
                response = d;
            }
        }
    })

    return response;
}

function diff(a,b, val) {
    return Math.abs(parseInt(a) - parseInt(b))
}

function dateRange(start, end) {
    var range = [];

    start = start.clone();

    var count = moment.duration(end - start).asDays();

    for (var i = 0; i <= count; i++) {
        range.push(start.clone());
        start.add(1, 'd');
    };

    return range;
}

function randomSnapshot(config, prev, timestamp) {
    var time = searchTrends(timestamp);

    var response = {
        climate: {
            indoor: {
                humidity: rand(20, 40),
                temperature: rand(68,72),
            },
            outdoor: {
                humidity: rand(20, 40),
                temperature: rand(60,90),
            }
        },
        monitors: config['monitors'].list.map(function(d) {
            return rand(d.min + time.weight * 10, d.max + time.weight * 10);
        }),
        controls: config['controls'].list.map(function(d) {
            return rand(d.min + time.weight * 10, d.max + time.weight * 10);
        })
    }

    var electric_monitors = response.monitors.filter(function(d, i) {
        return config['monitors'].list[i].metric == 'electric';
    })

    var water_monitors = response.monitors.filter(function(d, i) {
        return config['monitors'].list[i].metric == 'water';
    })

    response.electric = {
            average: electric_monitors.reduce(function(prev, curr) {
                return prev + curr;
            }) / electric_monitors.length,
            total: electric_monitors.reduce(function(prev, curr) {
                return prev + curr;
            }) * 0.166666667
    };

    response.water = {
            average: water_monitors.reduce(function(prev, curr) {
                return prev + curr;
            }) / water_monitors.length,
            total: water_monitors.reduce(function(prev, curr) {
                return prev + curr;
            }) * 0.166666667
    };


    // if (prev) {
    //     response.electric.average = prev.electric.average + response.electric.average * rand(-.5,.5);
    //     response.electric.total = prev.electric.total + response.electric.total * rand(-.5,.5);

    //     response.water.average = prev.water.average + response.water.average * rand(-.5,.5);
    //     response.water.total = prev.water.total + response.water.total * rand(-.5,.5);
    // }

    if (timestamp) response.timestamp = moment(timestamp).format();

    return response;
}

// This resets the firebase and sets it up for testing
// Use it when you want a clean slate
function bootstrapFirebase() {
    getConfig(function(config) {
         var fb = new Firebase(c.FIREBASE_URL);

        // var dates = dateRange(moment().subtract(40, 'd'), moment());

        var snapshots = {
            daily: {},
            hourly: {},
            all: {}
        }

        var all = snapshotRange(moment().subtract(40, 'd'), moment())

        all = all.map(function(date) {
            return randomSnapshot(config, null, date);
        })

    // console.log(all)


        // var prev = null;

        // fb.child('snapshots').set(snapshots)

        // console.log("Pushing random snapshots (" + all.length + "): ")

        all.forEach(function(e) {
            fb.child('snapshots/all').push().setWithPriority(e, +moment(e.timestamp));
            process.stdout.write(".");
        })
    })
}

function pushRandomSnapshot() {
    getConfig(function(config) {
        var fb = new Firebase(c.FIREBASE_URL);

        // fb.child('snapshots/all').limit(1).once('value', function(fbSnap) {
        //     var key = Object.keys(fbSnap.val())[0];
        //     var snapshot = randomSnapshot(config, fbSnap.val()[key], moment());
        //     fb.child('snapshots/all').push().setWithPriority(snapshot, +moment(snapshot.timestamp));
        // })

        var snapshot = randomSnapshot(config, null, moment());
        console.log(snapshot)
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
            monitors: results.monitors,
            firebase_url: c.FIREBASE_URL
        }

        callback(response)
    })

}

function getUrl(endpoint) {
    return url.resolve(c.API_URL + ':' + c.API_PORT, endpoint)
}

module.exports.bootstrapFirebase = bootstrapFirebase;
module.exports.randomSnapshot = randomSnapshot;
module.exports.dateRange = dateRange;
module.exports.pushRandomSnapshot = pushRandomSnapshot;
module.exports.startSnapshots = startSnapshots;