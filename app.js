
/**
 * Module dependencies.
 */

var express    = require('express')
    , stylus   = require('stylus')
    , nib      = require('nib')
    , routes   = require('./routes')
    , user     = require('./routes/user')
    , http     = require('http')
    , path     = require('path')
    , Firebase = require('firebase')
    , moment   = require('moment');

var app = express();

// Stylus compiler
function compile(str, path) {
    return stylus(str)
        .set('filename', path)
        .set('compress', true)
        .use(nib())
}

app.configure(function(){
    app.set('port', process.env.PORT || 3000);
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
    app.use(express.favicon());
    app.use(express.logger('dev'));
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(app.router);
    app.use(stylus.middleware(
        { src: __dirname + '/public'
            , compile: compile
        }
    ))
    app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
    app.use(express.errorHandler());
});

app.get('/', routes.index);
app.get('/users', user.list);

http.createServer(app).listen(app.get('port'), function(){
    console.log("Express server listening on port " + app.get('port'));
    // Uncomment the next line to reset the Firebase
    // bootstrapFirebase();
});

function rand(min, max) {
    return Math.random() * (max - min) + min;
}

function dateRange(start, end) {
    var range = [];

    start = start.clone();

    var count = moment.duration(end - start).asDays();

    for (var i = 1; i <= count; i++) {
        range.push(start.clone());
        start.add(1, 'd');
    };

    return range;
}

function randomSnapshot() {
    return {
        electric: {
            average: rand(.5,1), // in kW
            total: rand(.08, .16) // in kWh
        },
        water: {
            average: rand(0,1), // in gal/hour
            total: rand(0,1) // in gal
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
}

// This resets the firebase and sets it up for testing
// Use it when you want a clean slate
function bootstrapFirebase() {
    var fb = new Firebase('https://start-home.firebaseio.com/');

    var dates = dateRange(moment().subtract(10, 'd'), moment());

    var snapshots = {
        daily: {},
        all: {}
    }

    var all = [];

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
            var snap = randomSnapshot();
            snap.timestamp = s.format()
            batch.push(snap);
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
        snapshots: snapshots
    })

    all.forEach(function(e) {
        fb.child('snapshots/all').push().setWithPriority(e, +moment(e.timestamp));
    })
}

function generateRandomData() {
    var fb = new Firebase('https://start-home.firebaseio.com/');


}
