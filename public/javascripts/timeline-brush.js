var timeline = {
	data: [],

	// configuration
	height: 45,
	width: 100, // this will get updated
	margin: {
		left: 30,
		right: 30
	},
	scales: {
		overall: d3.time.scale(),
		past: d3.time.scale(),
		y: d3.scale.linear()
	},
	lines: {
		past: d3.svg.line(),
		goal: d3.svg.line()
	},
	paths: {
		past: null,
		goal: null
	},
	brush: d3.svg.brush(),
	xAxis: d3.svg.axis(),

	init: function() {
		this.width = $('#timeline figure').width() / 2;

		var scales = this.scales,
			lines = this.lines,
			margin = this.margin;

		scales.overall.range([margin.left, this.width - margin.right]);
		scales.y.range([this.height, 0])

		lines.past
			.interpolate("basis")
			.x(function(d) { return scales.overall(new Date(d.timestamp)) })
			.y(function(d) { return scales.y(d.stats.electric.avg_power) });

		lines.goal
			.interpolate("basis")
			.x(function(d) { return scales.overall(new Date(d.timestamp)) })
			.y(function(d) { return scales.y(0) });

		this.brush
			.x(scales.past)
			.on("brush", this.brushed)

		this.xAxis
			.scale(scales.overall)
			// .ticks(d3.time., 1)
	},

	draw: function() {
		var svg = d3.select('#timeline figure').append('svg');

		// the brush is appended first in order to place it below the lines
		// this is not ideal because the lines grab the touch before the brush can
		// setting the brush to blend-mode: color would be great, but this is hard
		// svg.append("g")
		// 	.attr("class", "x brush")
		// 	.call(this.brush)
		// 	.selectAll("rect")
		// 		.attr("y", -6)
		// 		.attr("height", this.height + 35)
		// 		// .attr("transform", "translate("+this.margin.left+",0)");

		svg.append("rect")
			.attr("class", "split")
			.attr("x", this.scales.overall(new Date()))
			.attr("height", '70px')
			.attr("width", '4px')

		this.paths.past = svg.append("path")
			.data([this.data])
			.attr("class", "past line")
			.attr("transform", "translate(0,5)")
			.attr("d", this.lines.past);

		this.paths.goal = svg.append("path")
			.data([this.data])
			.attr("class", "goal line")
			.attr("transform", "translate(0,5)")
			.attr("d", this.lines.goal);

		this.axis = svg.append("g")
			.attr("class", "x axis")
			// .attr("transform", "translate("+this.margin.left+",32)")
			.call(this.xAxis);

		function past_data(d) {
			if (d.stats) return true;
		}
	},

	add_datum: function(datum) {
		this.data.push(datum)

		var scales = this.scales,
			lines = this.lines,
			margin = this.margin,
			data = this.data;

		scales.overall
			.domain([moment().subtract(2, 'minute'), new Date()])

		scales.y
			.domain(d3.extent(this.data, function(d) { return d.stats.electric.avg_power; }));

		this.update();
	},

	update: function() {
		clearTimeout(this.update_timer)
		this.update_timer = setTimeout(real_update, 100);

		var paths = this.paths,
			lines = this.lines,
			axis = this.axis,
			xAxis = this.xAxis,
			data = this.data,
			scales = this.scales;

		function real_update() {
			paths.past
				.transition()
				.attr('d', lines.past)

			paths.goal
				.transition()
				.attr('d', lines.goal)

			axis.transition().call(xAxis);
		}
	},

	set_goal: function(new_goal) {
		var scales = this.scales;

		this.lines.goal
			.y(function(d) { return scales.y(new_goal) });

		this.update();
	},

	brushed: function() {
		// console.log("brushhhhhhh")
	}
}