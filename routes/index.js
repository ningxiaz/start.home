
/*
 * GET home page.
 */

var request = require('request'),
	url     = require('url'),
	async   = require('async'),
	config  = require('../config');

var port     = 5000,
	base_url = "http://localhost";

exports.index = function(req, res){
	// getConfig(function(response) {
		res.render('index', { 
			title: 'Stanford Solar Decathlon',
			// config: response
		});
	// })
};

// For loading the config into the javascript
exports.config = function(req, res){
	getConfig(function(response) {
		res.send('var config =' + JSON.stringify(response) + ';')
	})
};

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
			firebase_url: config.FIREBASE_URL
		}

		callback(response)
	})
}

function getUrl(endpoint) {
	return url.resolve(base_url + ':' + port, endpoint)
}