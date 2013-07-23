var past_timeline = {
	data: [
		{time: 00, usage: 1},
		{time: 01, usage: 2},
		{time: 02, usage: 3},
		{time: 03, usage: 2},
		{time: 04, usage: 4},
		{time: 05, usage: 1},
		{time: 06, usage: 6},
		{time: 07, usage: 2},
		{time: 08, usage: 3},
		{time: 09, usage: 3},
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
	height: 30,
	x: d3.scale.linear(),
	y: d3.scale.linear(),
	line: d3.svg.line(),
	xAxis: d3.svg.axis(),

	init: function() {
		this.height = 60;
		this.width = $('#timeline .past').width();

		x = d3.scale.linear()
    		.range([0, this.width]);

		y = d3.scale.linear()
    		.range([this.height, 0]);

    	this.xAxis.scale(x).tickValues([2,6,10,14])
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

		svg.append("g")
    		.attr("transform", "translate(0,35)")
    		.call(this.xAxis);
	}
}