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

	init: function(data) {
		this.data = data;
		this.width = $('#timeline figure').width();

		var scales = this.scales,
			lines = this.lines,
			margin = this.margin;

		scales.overall
			.domain([data.start_date, data.end_date])
			.range([margin.left, this.width - margin.right]);

		scales.past
			.domain([data.start_date, data.now])
			.range([margin.left, scales.overall(data.now)])

		scales.y
			.range([0, this.height])
			.domain(d3.extent(this.data, function(d) { return get_wattage(d); }));

		this.lines.past
			.interpolate("basis")
			.x(function(d) { return scales.past(new Date(d.timestamp)) })
			.y(function(d) { return scales.y(get_wattage(d)) });

		this.brush
			.x(scales.past)
			.on("brush", this.brushed)

		this.xAxis
			.scale(scales.overall)
			.ticks(d3.time.months, 1)

		function get_wattage(d) {
			if (d.stats) return d.stats.total_wattage;
			return d.target.wattage;
		}
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
			.attr("d", this.lines.past);

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

		this.y.domain(d3.extent(this.data, function(d) { return this.get_wattage(d); }))

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