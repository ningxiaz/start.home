
/**
 * Module dependencies.
 */

var express  = require('express')
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

  generateRandomData();
});

// generates a new random snapshot every second and pushes it to firebase
function generateRandomData() {
  var rootRef = new Firebase('https://start-home.firebaseio.com/');
  var snapRef = rootRef.child('usage/snapshots');
  
  setInterval(addDatum, 10000)

  var water_num = Math.random(),
      electric_num = Math.random();

  function addDatum() {
    water_num += (Math.random() - .5) * .1;
    electric_num += (Math.random() - .5) * .1;

    var new_datum = {
      timestamp: moment().format(),
      stats: {
        electric: {
          avg_power: electric_num,
          total_energy: electric_num
        },
        water: {
          avg_flow: water_num,
          total_flow: water_num
        }
      },
      electric: {
        1: {
          avg_power: electric_num,
          total_energy: electric_num
        }
      },
      water: {
        1: {
          avg_flow: water_num,
          total_flow: water_num
        }
      }
    }

    snapRef.push().setWithPriority(new_datum, moment().format());
  }
}
