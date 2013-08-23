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
		x: d3.time.scale(),
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
		this.width = $('#timeline figure').width();

		var scales = this.scales,
			lines = this.lines,
			margin = this.margin;

		scales.x.range([margin.left, this.width - margin.right]);
		scales.y.range([this.height, 0])

		lines.past
			// .interpolate("basis")
			.x(function(d) { return scales.x(new Date(d.timestamp)) })
			.y(function(d) { return scales.y(d.stats.electric.avg_power) });

		lines.goal
			// .interpolate("basis")
			.x(function(d) { return scales.x(new Date(d.timestamp)) })
			.y(function(d) { return scales.y(0) });

		this.brush
			.x(scales.x)
			.on("brush", this.brushed)

		this.xAxis
			.scale(scales.x)
			// .ticks(d3.time., 1)

		this.now = new Date();
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


		var group = svg.append('g')
			.attr("transform", "translate(0,5)")

		this.paths.past = group.append("path")
			.data([this.data])
			.attr("class", "past line")
			.attr("d", this.lines.past);

		this.split = svg.append("rect")
			.attr("class", "split")
			.attr("x", this.scales.x(new Date()) - 10)
			.attr("height", '70px')
			.attr("width", '10px')

		this.paths.goal = group.append("path")
			.data([this.data])
			.attr("class", "goal line")
			.attr("d", this.lines.goal);

		this.axis = svg.append("g")
			.attr("class", "x axis light")
			// .attr("transform", "translate("+this.margin.left+",32)")
			.call(this.xAxis);

		function past_data(d) {
			if (d.stats) return true;
		}
	},

	// unused right now
	add_datum: function(datum) {
		this.data.push(datum)
		this.now = new Date(datum.timestamp)

		var scales = this.scales,
			lines = this.lines,
			margin = this.margin,
			data = this.data;

		scales.x
			.domain([moment().subtract(5, 'm'), moment().add(5, 'm')])

		scales.y
			.domain([0,1.2]);

		this.update();
		if (this.data.length > 200) this.data.shift();
	},

	set_data: function(data) {
		data = d3.values(data);
		// data.sort(function(a,b) { return a.timestamp < b.timestamp; })

		this.data = data;
		this.now = new Date(data[data.length - 1].timestamp)
		var start = new Date(data[0].timestamp);
		var end = moment().add(this.now).subtract(start)

		this.scales.x
			.domain([start, end])

		this.scales.y
			.domain([d3.min(data, function(d) { return d.stats.electric.avg_power; }) - .1, 
					 d3.max(data, function(d) { return d.stats.electric.avg_power; }) + .1]);


		// this.update();
		this.paths.past.data([data]).attr('d', this.lines.past)
		this.paths.goal.data([data]).attr('d', this.lines.goal)
		this.axis.call(this.xAxis)
		this.split.attr("x", this.scales.x(this.now) - 5)
	},


	// unused right now
	update: function() {
		// clearTimeout(this.update_timer)
		// this.update_timer = setTimeout(real_update, 100);

		var paths = this.paths,
			lines = this.lines,
			axis = this.axis,
			xAxis = this.xAxis,
			data = this.data,
			scales = this.scales,
			split = this.split,
			now = this.now;

		// paths.past.attr('d', lines.past)

		real_update();

		function real_update() {
			paths.past
				.attr('d', lines.past)
		// 		// .attr('transform', null)
		// 		// .transition()
		// 		// .duration(10000)
		// 		// .ease('linear')
		// 		// .attr('transform', 'translate(' + (scales.x(moment(scales.x.domain()[0]).subtract(10,'s')) - 30) + ')')

			paths.goal
		// 		// .transition()
				.attr('d', lines.goal)

			axis
		// 		// .transition()
		// 		// .duration(10000)
		// 		// .ease('linear')
				.call(xAxis);

			split
				.attr("x", scales.x(now) - 5)
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