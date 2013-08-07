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

	init: function(data) {
		this.data = data;
		this.width 	= $('.goal-view figure').width();
		this.height = $('.goal-view figure').height();

		var	margin = this.margin,
			scales = this.scales,
			lines  = this.lines,
			paths  = this.paths;

		var last_week = moment(data.now).subtract(2, 'week');

		scales.x
			.domain([last_week, data.end_date])
			.range([margin.left, this.width - margin.right]);

		scales.y
			.domain([0, 9])
			.range([this.height - margin.top, margin.bottom]);

		lines.electricity.past
			.interpolate('basis')
			.x(function(d) { return scales.x(new Date(d.timestamp)) })
			.y(function(d) { return scales.y(get_wattage(d)) });

		lines.electricity.goal
			.interpolate('basis')
			.x(function(d) { return scales.x(new Date(d.timestamp)) })
			.y(function(d) { return scales.y(d.target.wattage) });

		lines.water.past
			.interpolate('basis')
			.x(function(d) { return scales.x(new Date(d.timestamp)) })
			.y(function(d) { return scales.y(get_flow(d)) });

		lines.water.goal
			.interpolate('basis')
			.x(function(d) { return scales.x(new Date(d.timestamp)) })
			.y(function(d) { return scales.y(d.target.flow) });


		function get_wattage(d) {
			if (d.stats) return d.stats.total_wattage;
			return d.target.wattage;
		}

		function get_flow(d) {
			if (d.stats) return d.stats.total_flow;
			return d.target.flow;
		}
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

		// the "now" bar

		svg.append("rect")
			.attr("class", "split")
			.attr("x", this.scales.x(this.data.now))
			.attr("height", this.height)
			.attr("width", '4px');

		// append lines

		this.paths.electricity.past = svg.append("path")
			.data([this.data.filter(past_data)])
			.attr("class", "past line dark electricity")
			.attr("transform", "translate(0,5)")
			.attr("d", this.lines.electricity.past);

		this.paths.electricity.goal = svg.append("path")
			.data([this.data])
			.attr("class", "goal line dark electricity")
			.attr("transform", "translate(0,5)")
			.attr("marker-end", "url(#yellow-circle)")
			.attr("d", this.lines.electricity.goal);

		this.paths.water.past = svg.append("path")
			.data([this.data.filter(past_data)])
			.attr("class", "past line dark water")
			.attr("transform", "translate(0,5)")
			.attr("d", this.lines.water.past);

		this.paths.water.goal = svg.append("path")
			.data([this.data])
			.attr("class", "goal line dark water")
			.attr("transform", "translate(0,5)")
			.attr("marker-end", "url(#blue-circle)")
			.attr("d", this.lines.water.goal);

		// append handles

		var electricity_target = this.data[this.data.length - 1].target.wattage;
		var water_target = this.data[this.data.length - 1].target.flow;

		svg.append('circle')
			.attr('class', 'electricity handle')
			.attr('r', 15)
			.attr('cx', this.scales.x(this.data.end_date))
			.attr('cy', this.scales.y(electricity_target))

		svg.append('circle')
			.attr('class', 'water handle')
			.attr('r', 15)
			.attr('cx', this.scales.x(this.data.end_date))
			.attr('cy', this.scales.y(water_target))

		function past_data(d) {
			if (d.stats) return true;
		}
	}
}