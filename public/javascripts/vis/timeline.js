function timeline(brushFunc) {

	// dimensions
	var width  = $('#timeline').width(),
		height = $('#timeline').height();

	// margins
	var margin = {
		top: 5,
		bottom: 5,
		left: 30,
		right: 30
	}

	// scales
	var x  = d3.time.scale().range([margin.left, width - margin.right]),
		y3 = d3.scale.linear().range([margin.top, height - margin.bottom ]);
		y4 = d3.scale.linear().range([margin.top, height - margin.bottom ]);



	// graphics
	var svg = d3.select('#timeline').append('svg');

	var brush = d3.svg.brush(),
		brush_shape = svg.append('g');

	var	lines = {
			electric: d3.svg.line(),
			water: d3.svg.line()
		},
		paths = {
			electric: svg.append('path'),
			water: svg.append('path')
		};

	// data
	var data = [];

	// axes
	var xAxis = d3.svg.axis();

	var axes = {
		x: svg.append('g')
	}

	// animation
	var transition_duration = 500;
		
	// set up

	svg
		.attr('width', width)
		.attr('height', height);

	lines.electric
		.interpolate('basis')
		.x(function(d) { return x(new Date(d.timestamp)) })
		.y(function(d) { return y3(d.electric.average) })

	lines.water
		.interpolate('basis')
		.x(function(d) { return x(new Date(d.timestamp)) })
		.y(function(d) { return y4(d.water.average) })

	paths.electric
		.attr('class', 'line round thin electric')

	paths.water
		.attr('class', 'line round thin water')

	brush
		.x(x)
		.on('brushstart', brushstart)
    	.on('brushend', brushend);

    brush_shape
    	.attr('class', 'x brush')

    xAxis
		.scale(x)
		.orient('top')

	axes.x
		.attr("class", "x axis light no-domain")
    	.attr("transform", "translate(0," + height + ")")

	function update(new_data) {
		data = new_data;

		var start = new Date(data[0].timestamp),
			end   = new Date(data[data.length-1].timestamp);

		var eExtent = d3.extent(data, function(d) { return d.electric.average; }),
			wExtent = d3.extent(data, function(d) { return d.water.average; });

		x.domain([start,end])
		y3.domain(eExtent).nice()
		y4.domain(wExtent).nice()

		paths.electric
			.data([data])
			.attr('d', lines.electric)

		paths.water
			.data([data])
			.attr('d', lines.water)


		if (brush.empty()) {
			brushend();
		}

		brush_shape
			.call(brush)
			.selectAll("rect")
				.attr("height", height);

		axes.x
			.call(xAxis)
	}

	function brushstart() {
		// display the help text
	}

	function brushend() {
		var end = moment(data[data.length-1].timestamp);

		if (brush.empty()) brush.extent([moment(end).subtract(1,'d'), end])

		brushFunc(brush.extent())
	}

	return {
		update: update,
	}
}