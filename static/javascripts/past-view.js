var past_view = {
	data: [],

	height: 0,
	width: 0,

	scales: {
		x: d3.time.scale(),
		electric: d3.scale.linear(),
		water: d3.scale.linear()
	},

	visuals: {
		area: d3.svg.area(),
	},

	svgElems: {},

	init: function() {
		this.height = $('.past-view .main-vis').height()
		this.width  = $('.past-view .main-vis').width()

		var scales = this.scales,
			area   = this.visuals.area;

		scales.x.range([0,this.width])

		area
			.interpolate('basis')
			.x(function(d) { return scales.x(new Date(d.timestamp)) })
			.y0(function(d) { return 300; })
			.y1(function(d) { return d.stats.electric.avg_power * 500; });
	},

	draw: function() {
		var svg = d3.select('.past-view .main-vis').append('svg');

		var svgElems = this.svgElems;

		svgElems.area = svg.append('path')
			.attr('class', 'area')
			.data([this.data])
			.attr('d', this.visuals.area)
	},

	set_data: function(data) {
		data = d3.values(data);
		// data.sort(function(a,b) { return a.timestamp < b.timestamp; })

		this.data = data;
		this.now = new Date(data[data.length - 1].timestamp)
		var start = new Date(data[0].timestamp);

		this.scales.x
			.domain([start, this.now])

		this.svgElems.area
			.data([this.data])
			.transition()
			.duration(1000)
			.attr('d', this.visuals.area)
	}
}