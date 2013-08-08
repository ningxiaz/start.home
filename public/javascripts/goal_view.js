// Goal view controls
$(function() {
	// $('.adjust_behaviors').hide();
	$('.set_hvac').hide();
})

// Goal view visuals
var goal_view = {
	data: [],

	height: 100,
	width: 100,
	margin: {
		left: 0,
		right: 360,
		top: 30,
		bottom: 30,	
	},

	scales: {
		x: d3.time.scale(),
		y: d3.scale.linear()
	},

	lines: {
		electricity: {
			past: d3.svg.line(),
			goal: d3.svg.line()
		},
		water: {
			past: d3.svg.line(),
			goal: d3.svg.line()
		}
	},

	paths: {
		electricity: {
			past: null,
			goal: null
		},
		water: {
			past: null,
			goal: null
		}
	},

	xAxis: d3.svg.axis(),

	init: function() {
		this.width 	= $('.goal-view figure').width();
		this.height = $('.goal-view figure').height();

		var	margin = this.margin,
			scales = this.scales,
			lines  = this.lines,
			paths  = this.paths;

		scales.x
			.range([margin.left, this.width - margin.right]);

		scales.y
			.range([this.height - margin.top, margin.bottom]);

		lines.electricity.past
			// .interpolate('basis')
			.x(function(d) { return scales.x(new Date(d.timestamp)) })
			.y(function(d) { return scales.y(d.stats.electric.avg_power) });

		lines.electricity.goal
			// .interpolate('basis')
			.x(function(d) { return scales.x(new Date(d.timestamp)) })
			.y(function(d) { return scales.y(0) });

		lines.water.past
			// .interpolate('basis')
			.x(function(d) { return scales.x(new Date(d.timestamp)) })
			.y(function(d) { return scales.y(d.stats.water.avg_flow) });

		lines.water.goal
			// .interpolate('basis')
			.x(function(d) { return scales.x(new Date(d.timestamp)) })
			.y(function(d) { return scales.y(0) });
	},

	draw: function() {
		var svg = d3.select('.goal-view figure').append('svg');

		// a marker-end
		svg.append("marker")
			.attr("id", "blue-circle")
			.attr("refX", 7) /*must be smarter way to calculate shift*/
			.attr("refY", 7)
			.attr("markerWidth", 14)
			.attr("markerHeight", 14)
			.attr("orient", "auto")
			.append("circle")
				.attr('class', 'marker')
			    .attr("r", 7)
			    .attr('cy', 7)
			    .attr('cx', 7)

		svg.append("marker")
			.attr("id", "yellow-circle")
			.attr("refX", 7) /*must be smarter way to calculate shift*/
			.attr("refY", 7)
			.attr("markerWidth", 14)
			.attr("markerHeight", 14)
			.attr("orient", "auto")
			.append("circle")
				.attr('class', 'marker')
			    .attr("r", 7)
			    .attr('cy', 7)
			    .attr('cx', 7)

		// append lines

		this.paths.electricity.past = svg.append("path")
			.data([this.data])
			.attr("class", "past line dark electricity")
			.attr("transform", "translate(0,5)")
			.attr("d", this.lines.electricity.past);

		this.paths.water.past = svg.append("path")
			.data([this.data])
			.attr("class", "past line dark water")
			.attr("transform", "translate(0,5)")
			.attr("d", this.lines.water.past);

		

		// the "now" bar

		this.split = svg.append("rect")
			.attr("class", "split")
			.attr("x", this.scales.x(new Date()))
			.attr("height", this.height)
			.attr("width", '10px');

		this.paths.electricity.goal = svg.append("path")
			.data([this.data])
			.attr("class", "goal line dark electricity")
			.attr("transform", "translate(0,5)")
			.attr("marker-end", "url(#yellow-circle)")
			.attr("d", this.lines.electricity.goal);

		this.paths.water.goal = svg.append("path")
			.data([this.data])
			.attr("class", "goal line dark water")
			.attr("transform", "translate(0,5)")
			.attr("marker-end", "url(#blue-circle)")
			.attr("d", this.lines.water.goal);


		// // append handles

		// var electricity_target = this.data[this.data.length - 1].target.wattage;
		// var water_target = this.data[this.data.length - 1].target.flow;

		// svg.append('circle')
		// 	.attr('class', 'electricity handle')
		// 	.attr('r', 15)
		// 	.attr('cx', this.scales.x(this.data.end_date))
		// 	.attr('cy', this.scales.y(electricity_target))

		// svg.append('circle')
		// 	.attr('class', 'water handle')
		// 	.attr('r', 15)
		// 	.attr('cx', this.scales.x(this.data.end_date))
		// 	.attr('cy', this.scales.y(water_target))

		function past_data(d) {
			if (d.stats) return true;
		}
	},

	add_datum: function(datum) {
		this.data.push(datum)
		this.now = new Date(datum.timestamp)

		var scales = this.scales,
			lines = this.lines,
			margin = this.margin,
			data = this.data;

		scales.x
			.domain([moment().subtract(7, 'm'), moment().add(10, 'm')])

		scales.y
			.domain([-1, 1.5]);

		this.update();
		if (this.data.length > 200) this.data.shift();
	},

	update: function() {

		// this timer helps deal with the initial rush of data on a refresh
		// the on('child_added') event is fired for each existing child on page load
		// we wait till all of the data has been appended before redrawing
		// not pretty...
		clearTimeout(this.update_timer)
		this.update_timer = setTimeout(real_update, 100);

		var paths = this.paths,
			lines = this.lines,
			data = this.data,
			scales = this.scales,
			split = this.split,
			now = this.now;

		function real_update() {
			paths.electricity.past
				.attr('d', lines.electricity.past)
				// .attr('transform', null)
				// .transition()
				// .duration(10000)
				// .ease('linear')
				// .attr('transform', 'translate(' + scales.x(moment(scales.x.domain()[0]).subtract(10,'s')) + ')')

			paths.electricity.goal
				.transition()
				.attr('d', lines.electricity.goal)

			paths.water.past
				.attr('d', lines.water.past)
				// .attr('transform', null)
				// .transition()
				// .duration(1000)
				// .attr('transform', 'translate(' + scales.x(moment(scales.x.domain()[0]).subtract(10,'s')) + ')')

			paths.water.goal
				.transition()
				.attr('d', lines.water.goal)

			split
				.attr("x", scales.x(now) - 5)
		}
	},

	set_goals: function(new_goals) {
		var scales = this.scales;

		this.lines.electricity.goal
			.y(function(d) { return scales.y(new_goals.electric) });

		this.lines.water.goal
			.y(function(d) { return scales.y(new_goals.water) });

		this.update();
	}
}