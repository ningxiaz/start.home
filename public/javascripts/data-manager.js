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
		this.data = RandomData({ 
			start_date: moment().subtract('M', 1),
			end_date: moment().add('M', 1),
			cutoff: moment(),
			count: 15
		});

		this.trigger('init', this.data)
	},

	update: function(datum) {
		var new_entry = this.process_datum(datum);
		this.data.push(new_entry);

		this.trigger('update', new_entry)
	}
}