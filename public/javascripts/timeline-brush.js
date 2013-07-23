var timeline = {
	data: [],

	// configuration
	height: 45,
	width: 100, // this will get updated
	margin: {
		left: 30,
		right: 30
	},
	split: .6, // percentage to split between past and future views
	x: d3.time.scale(),
	y: d3.scale.linear(),
	line: d3.svg.line(),
	brush: d3.svg.brush(),
	xAxis: d3.svg.axis(),
	path: null,

	init: function(data) {
		this.data = data;

		this.width = $('#timeline figure').width() / 2;

		this.x.range([this.margin.left, this.width - this.margin.right]);
		this.y.range([1, this.height - 1]);

		// get the first and last time in the data to set the domain
		var parseDate = d3.time.format("%Y-%m-%d %H:%M:%S")
		var startDate = parseDate.parse(this.data[0].timestamp),
			now       = parseDate.parse(this.data[this.data.length - 1].timestamp);

		var endDate = d3.time.day.offset(now, 1)

		this.x.domain([startDate, endDate]);
		this.y.domain(d3.extent(this.data, function(d) { return d.total; }));

		var x = this.x,
			y = this.y;

		this.line
			// .interpolate("basis")
			.x(function(d) { return x(parseDate.parse(d.timestamp)) })
			.y(function(d) { return y(d.total) });

		this.brush
			.x(x)
			.on("brush", this.brushed)

		this.xAxis
			.scale(this.x)
			.ticks(d3.time.hours, 1)
	},

	draw: function() {
		var svg = d3.select('#timeline figure svg')

		// the brush is appended first in order to place it below the lines
		// this is not ideal because the lines grab the touch before the brush can
		// setting the brush to blend-mode: color would be great, but this is hard
		svg.append("g")
			.attr("class", "x brush")
			.call(this.brush)
			.selectAll("rect")
				.attr("y", -6)
				.attr("height", this.height + 35)
				// .attr("transform", "translate("+this.margin.left+",0)");

		this.path = svg.append("path")
			.data([this.data])
			.attr("class", "line")
			.attr("transform", "translate(0,5)")
			.attr("d", this.line);

		svg.append("g")
			.attr("class", "x axis")
			// .attr("transform", "translate("+this.margin.left+",32)")
			.call(this.xAxis);
	},

	update: function(datum) {

		var totalLength = this.path.node().getTotalLength();

		var parseDate = d3.time.format("%Y-%m-%d %H:%M:%S")
		var lastDate = parseDate.parse(this.data[this.data.length - 2].timestamp);
		var newDate = parseDate.parse(datum.timestamp);

		this.y.domain(d3.extent(this.data, function(d) { return d.total; }))

		// this.line.interpolate("basis")

		this.path
			.attr("stroke-dasharray", totalLength)
			.attr("stroke-dashoffset", this.x(newDate) - this.x(lastDate))
			.attr("d", this.line)
			.transition()
			.duration(500)
			.ease("linear")
			.attr("stroke-dashoffset", 0)
	},

	brushed: function() {
		// console.log("brushhhhhhh")
	}
}