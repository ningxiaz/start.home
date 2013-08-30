$(function() {
	var view = presentView();

	view.init();

	$('.pane-container').on('segue', function(e, state) {
		if (state == 1) view.activate();
		else view.deactivate();
	}) 
})

function presentView() {

	var active, fb, vis;

	function init() {
		console.log("Initializing present view")

		active = false;
		fb = new Firebase('https://start-home.firebaseio.com');

		vis = {
			three: three(),
		};

		fb.child('snapshots/all').limit(18).on('value', function(snapshot) {
			snapshot = snapshot.val();

			var data = d3.values(snapshot)
			vis.three.update(data);
		})

	}

	function activate() {
		if (active) return;

		console.log("Activating present view")
		active = true;

		// vis.three.activate()
	}

	function deactivate() {
		if (!active) return;

		console.log("Deactivating present view")
		active = false;

		// vis.three.deactivate()
	}

	// expose the API
	return {
		init: init,
		activate: activate,
		deactivate: deactivate
	}
}

function three() {

	// dimensions
	var width  = $('#three').width(),
		height = $('#three').height();

	// margins
	var margin = {
		top: 20,
		bottom: 20,
		left: 0,
		right: 0
	}

	// scales
	var x  = d3.time.scale().range([margin.left, width - margin.right]),
		y1 = d3.scale.linear().range([margin.top, height - margin.bottom ]);
		y2 = d3.scale.linear().range([margin.top, height - margin.bottom ]);

	// graphics
	var svg = d3.select('#three').append('svg'),
		lines = {
			electric: d3.svg.line(),
			water: d3.svg.line()
		},
		shapes = {},
		paths = {},
		areas = {
			electric: d3.svg.area(),
			water: d3.svg.area()
		};

	shapes.area_electric = svg.append('path'),
	paths.electric = svg.append('path'),

	shapes.area_water = svg.append('path'),
	paths.water = svg.append('path')

	// data
	var data = [];

	// axes
	var xAxis = d3.svg.axis(),
		y1Axis = d3.svg.axis(),
		y2Axis = d3.svg.axis();

	var axes = {
		x: svg.append('g'),
		y1: svg.append('g'),
		y2: svg.append('g')
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
		.y(function(d) { return y1(d.electric.average) })

	lines.water
		.interpolate('basis')
		.x(function(d) { return x(new Date(d.timestamp)) })
		.y(function(d) { return y2(d.water.average) })

	areas.electric
		.interpolate('basis')
		.x(function(d) { return x(new Date(d.timestamp)) })
		.y0(function(d) { return height })
		.y1(function(d) { return y1(d.electric.average) })

	areas.water
		.interpolate('basis')
		.x(function(d) { return x(new Date(d.timestamp)) })
		.y0(function(d) { return height })
		.y1(function(d) { return y2(d.water.average) })

	xAxis
		.scale(x)
		.orient('top')
		// .tickPadding(10)

	y1Axis
		.scale(y1)
		.orient('right')
		.ticks(5)

	y2Axis.scale(y2)

	axes.x
		.attr("class", "x axis no-domain")
    	.attr("transform", "translate(0," + height + ")")

    axes.y1
		.attr("class", "y axis water no-domain")
    	.attr("transform", "translate("+(width - margin.right) +",0)")

	paths.electric
		.attr('class', 'line electric')

	paths.water
		.attr('class', 'line water')

	shapes.area_electric
		.attr('class', 'area electric')

	shapes.area_water
		.attr('class', 'area water')

	function update(new_data) {
		data = new_data;

		var start = new Date(data[0].timestamp),
			end   = new Date(data[data.length-1].timestamp);

		var eExtent = d3.extent(data, function(d) { return d.electric.average; }),
			wExtent = d3.extent(data, function(d) { return d.water.average; });

		x.domain([start,end])
		y1.domain(eExtent).nice()
		y2.domain(wExtent).nice()

		// paths.electric
		// 	.data([data])
		// 	.attr('d', lines.electric)

		// paths.water
		// 	.data([data])
		// 	.attr('d', lines.water)

		shapes.area_electric
			.data([data])
			.attr('d', areas.electric)

		shapes.area_water
			.data([data])
			.attr('d', areas.water)

		axes.x
			.call(xAxis)

		axes.y1
			.call(y1Axis)
	}

	function activate() {
		y1.range([margin.top, height - margin.bottom])
		y2.range([margin.top, height - margin.bottom])

		paths.electric
			.transition()
			.duration(transition_duration)
				.attr('d', lines.electric)

		paths.water
			.transition()
			.duration(transition_duration)
				.attr('d', lines.water)

		shapes.area_electric
			.transition()
			.duration(transition_duration)
				.attr('d', areas.electric)

		shapes.area_water
			.transition()
			.duration(transition_duration)
				.attr('d', areas.water)
	}

	function deactivate() {
		y1.range([height, height])
		y2.range([height, height])

		paths.electric
			.transition()
			.duration(transition_duration)
				.attr('d', lines.electric)

		paths.water
			.transition()
			.duration(transition_duration)
				.attr('d', lines.water)

		shapes.area_electric
			.transition()
			.duration(transition_duration)
				.attr('d', areas.electric)

		shapes.area_water
			.transition()
			.duration(transition_duration)
				.attr('d', areas.water)


	}

	return {
		update: update,
		activate: activate,
		deactivate: deactivate
	}
}








