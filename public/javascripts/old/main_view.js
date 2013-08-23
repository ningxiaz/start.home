var floorplan = {
	data: {},


	init: function() {

	},

	set_data: function(data) {
		data.outlets = data.outlets.filter(function(e) {
			if (!e) return false;
			return true;
		})

		this.data = data;

		this.update()
	},

	update: function() {
		var svg = d3.select('.floorplan svg');

		var o = svg.selectAll('.outlet')
			.data(this.data.outlets)


		o.transition()
			.duration(500)
			.attr('r', function(d) { return d.output })

		o.enter().append('circle')
			.attr('class', 'outlet shape electric')
			.attr('r', 0)
			.attr('cx', function(d) { return d.position.x })
			.attr('cy', function(d) { return d.position.y })
			.transition()
			.duration(500)
			.attr('r', function(d) { return d.output })
	}
}