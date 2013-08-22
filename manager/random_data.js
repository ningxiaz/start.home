var Firebase = require('firebase'),
    moment = require('moment');

function rand(min, max) {
    return Math.random() * (max - min) + min;
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

function randomSnapshot(prev, timestamp) {
    var response = {
        electric: {
            average: rand(.5,1), // in kW
            total: rand(.08, .16) // in kWh
        },
        water: {
            average: rand(3,4), // in gal/hour
            total: rand(15,20) // in gal
        },
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
        monitors: {
            0: rand(0,10),
            1: rand(0,10),
            2: rand(0,10),
            3: rand(0,10),
            4: rand(0,10),
            5: rand(0,10),
            6: rand(0,10),
            7: rand(0,10),
        },
        controls: {
            0: rand(0,1),
            1: rand(0,1),
            2: rand(0,1),
            3: rand(0,1),
            4: rand(0,1),
            5: rand(0,1),
            6: rand(0,1),
            7: rand(0,1),
        }
    }

    console.log(prev)

    if (prev) {
        response.electric.average = prev.electric.average + response.electric.average * rand(-.5,.5);
        response.electric.total = prev.electric.total + response.electric.total * rand(-.5,.5);

        response.water.average = prev.water.average + response.water.average * rand(-.5,.5);
        response.water.total = prev.water.total + response.water.total * rand(-.5,.5);
    }

    if (timestamp) response.timestamp = moment().format();

    return response;
}

// This resets the firebase and sets it up for testing
// Use it when you want a clean slate
function bootstrapFirebase() {
    var fb = new Firebase('https://start-home.firebaseio.com/');

    var dates = dateRange(moment().subtract(40, 'd'), moment());

    var snapshots = {
        daily: {},
        all: {}
    }

    var all = [];
    var prev = null;

    dates.forEach(function(date) {
        var newDay = snapshots.daily[date.startOf('day').format('MM-DD-YYYY')] = {
            sunrise: date.startOf('day').add(7, 'h').format(),
            sunset: date.startOf('day').add(19, 'h').format(),
            water: {},
            electric: {}
        };
        var s = date.clone();

        var batch = [];

        for(var i = 0; i < 144; i++) {
            var snap = randomSnapshot(prev);
            snap.timestamp = s.format()

            batch.push(snap);
            prev = snap;

            s.add(10, 'm');

            if (s.isAfter(moment())) break;
        }

        newDay.electric.average = batch.reduce(function(prev, curr) {
            return prev + curr.electric.average;
        }, 0) / batch.length;

        newDay.water.average = batch.reduce(function(prev, curr) {
            return prev + curr.water.average;
        }, 0) / batch.length;

        newDay.electric.total = batch.reduce(function(prev, curr) {
            return prev + curr.electric.total;
        }, 0);

        newDay.water.total = batch.reduce(function(prev, curr) {
            return prev + curr.water.total;
        }, 0);

        newDay.numSnapshots = batch.length;

        all = all.concat(batch);
    })

    fb.set({
        monitors: {
            0: { title: 'Kitchen outlets',     room: 'Kitchen',     type: 'outlets',   position: {x: 20,  y: 40}},
            1: { title: 'Dishwasher',          room: 'Kitchen',     type: 'appliance', position: {x: 30,  y: 100}},
            2: { title: 'Refrigerator',        room: 'Kitchen',     type: 'appliance', position: {x: 100, y: 20}},
            3: { title: 'Garbage disposal',    room: 'Kitchen',     type: 'appliance', position: {x: 20,  y: 120}},
            4: { title: 'Laundry',             room: 'Laundry',     type: 'appliance', position: {x: 30,  y: 30}},
            5: { title: 'Bathroom sink',       room: 'Bathroom',    type: 'faucet',    position: {x: 50,  y: 50}},
            6: { title: 'Toilet',              room: 'Bathroom',    type: 'bathroom',  position: {x: 100, y: 40}},
            7: { title: 'Shower',              room: 'Bathroom',    type: 'bathroom',  position: {x: 30,  y: 0}}
        },
        controls: {
            0: { title: "Living Room Uplights",   room: "Living room", type: "lights" },
            1: { title: "Living Room Downlights", room: "Living room", type: "lights" },
            2: { title: "Living Room Fan",        room: "Living room", type: "fan" },
            3: { title: "Kitchen Uplights",       room: "Kitchen",     type: "lights" },
            4: { title: "Kitchen Undercab",       room: "Kitchen",     type: "lights" },
            5: { title: "Kitchen Pendant",        room: "Kitchen",     type: "lights" },
            6: { title: "Bathroom Shower Light",  room: "Bathroom",    type: "lights" },
            7: { title: "Bathroom Shower Fan",    room: "Bathroom",    type: "fan" }
        },
        goals: {
            electric: rand(0,3),
            water: rand(0,3)
        },
        snapshots: snapshots
    })

    all.forEach(function(e) {
        fb.child('snapshots/all').push().setWithPriority(e, +moment(e.timestamp));
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

module.exports.bootstrapFirebase = bootstrapFirebase;
module.exports.randomSnapshot = randomSnapshot;
module.exports.dateRange = dateRange;
module.exports.pushRandomSnapshot = pushRandomSnapshot;
module.exports.startSnapshots = startSnapshots;
