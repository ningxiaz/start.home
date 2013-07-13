var past_timeline = {
	data: [
		{time: 0, usage: 1},
		{time: 1, usage: 2},
		{time: 2, usage: 3},
		{time: 3, usage: 2},
		{time: 4, usage: 4},
		{time: 5, usage: 1},
		{time: 6, usage: 6},
		{time: 7, usage: 2},
		{time: 8, usage: 3},
		{time: 9, usage: 3},
		{time: 10, usage: 2},
		{time: 11, usage: 3},
		{time: 12, usage: 4},
		{time: 13, usage: 3},
		{time: 14, usage: 3},
		{time: 15, usage: 0},
		{time: 16, usage: 5},
		{time: 17, usage: 2},
		{time: 18, usage: 3},
		{time: 19, usage: 3}
	],

	width: 0,
	height: 60,
	x: d3.time.scale(),
	y: d3.time.scale(),
	line: d3.svg.line(),

	init: function() {
		height = 60;
		width = $('#timeline .past').width();

		x = d3.time.scale()
    		.range([0, width]);

		y = d3.scale.linear()
    		.range([height, 0]);
	},

	draw: function() {
		var svg = d3.select("#past-timeline")

		line = d3.svg.line()
    		.interpolate('basis')
		    .x(function(d) { return x(d.time); })
		    .y(function(d) { return y(d.usage); });

			x.domain(d3.extent(this.data, function(d) { return d.time; }));
			y.domain(d3.extent(this.data, function(d) { return d.usage; }));

		svg.append("path")
			.datum(this.data)
			.attr("class", "line")
			.attr("d", line);
	}
}