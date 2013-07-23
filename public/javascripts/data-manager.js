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

	init: function(data) {
		data = $.map(data, this.process_datum);
		this.data = data;

		this.trigger('init', data)
	},

	update: function(datum) {
		var new_entry = this.process_datum(datum);
		this.data.push(new_entry);

		this.trigger('update', new_entry)
	},

	// just to sum up the totals on the sample data
	process_datum: function(datum) {
		var new_entry = datum;

		new_entry.timestamp = datum['Timestamp'];
		new_entry.total = 0;

		$.each(datum, function(k, v) {
			if (k == 'Timestamp' || k == 'timestamp') return;
			new_entry.total += v;
		})

		return new_entry;
	}
}