var data_manager = {
	data: [],
	callbacks: {},

	// add a callback to be fired on a specific event
	on: function(event, callback) {
		if (!this.callbacks[event]) this.callbacks[event] = [];

		this.callbacks[event].push(callback);
	},

	// fire each callback for a specific event
	trigger: function(event, data) {
		$.each(this.callbacks[event], function(k, callback) {
			callback(data);
		})
	},

	init: function() {
		
	},
}