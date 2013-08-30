$(function() {
	var view = pastView();

	view.init();

	$('.pane-container').on('segue', function(e, state) {
		if (state == 1) view.activate();
		else view.deactivate();
	})
})

function pastView() {

	var active, fb, vis;

	function init() {
		console.log("Initializing past view")

		active = false;
		fb = new Firebase('https://start-home.firebaseio.com');

		vis = {
			timeline: timeline(),
			tiles: tiles()
		};

		fb.child('snapshots/hourly').on('value', function(snapshot) {
			snapshot = snapshot.val();

			var data = d3.values(snapshot)
			vis.timeline.update(data);
		})

		fb.child('snapshots/all').limit(300).once('value', function(snapshot) {
			snapshot = snapshot.val();

			// There MUST be a better way to do this...
			// We're taking all the snapshots from the query and aggregating them by day and hour

			var data = d3.nest()
				.key(function(d) { return moment(d.timestamp).format('dddd') })
				.key(function(d) { return moment(d.timestamp).format('ha') })
				.rollup(function(leaves) {
					return {
						electric: {
							average: d3.mean(leaves, function(d) { return d.electric.average }),
							total:   d3.sum(leaves, function(d) { return d.electric.total })
						},
						water: {
							average: d3.mean(leaves, function(d) { return d.water.average }),
							total:   d3.sum(leaves, function(d) { return d.water.total })
						},
					}
				})
				.entries(d3.values(snapshot));

			data = data.map(function(day) {
				return day.values.map(function(hour) {
						return {
							day: day.key,
							hour: hour.key,
							electric: hour.values.electric,
							water: hour.values.water
						}
					})
			})

			data = d3.merge(data);

			vis.tiles.draw(data)
		})

	}

	function activate() {
		if (active) return;

		console.log("Activating past view")
		active = true;

		// vis.timeline.activate()
	}

	function deactivate() {
		if (!active) return;

		console.log("Deactivating past view")
		active = false;

		// vis.timeline.deactivate()
	}

	// expose the API
	return {
		init: init,
		activate: activate,
		deactivate: deactivate
	}
}

function timeline() {

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
		.attr('class', 'line thin electric')

	paths.water
		.attr('class', 'line thin water')

	brush
		.x(x)
    	.on("brush", brushed);

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

		brush_shape
			.call(brush)
			.selectAll("rect")
				.attr("height", height);

		axes.x
			.call(xAxis)
	}

	function brushed() {

	}

	return {
		update: update,
	}
}

function tiles() {

	// dimensions
	var width  = $('#tiles').width(),
		height = $('#tiles').height();

	// margins
	var margin = {
		top: 0,
		bottom: 0,
		left: 0,
		right: 0
	}

	// scales
	var x = d3.scale.ordinal()
				.domain(['12am', '1am', '2am', '3am', '4am', '5am', '6am', '6am', '7am', '8am', '9am', '10am', '11am', 
					     '12pm', '1pm', '2pm', '3pm', '4pm', '5pm', '6pm', '6pm', '7pm', '8pm', '9pm', '10pm', '11pm'])
				.rangePoints([margin.left, width - margin.right]),
		y = d3.scale.ordinal()
				.domain(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'])
				.rangePoints([margin.top, height - margin.bottom]),
		color = d3.scale.quantile()
					.range(colorbrewer.Spectral[9]);

	// data
	var data = [];

	// graphics
	var svg = d3.select('#tiles').append('svg');


	function draw(new_data) {
		data = new_data;

		color.domain(d3.extent(data, function(d) { return d.electric.average }))

		console.log(color.domain())
		console.log(color.range())

		var heatMap = svg.selectAll('.hour')
			.data(data)
			.enter().append('rect')
			.attr('x', function(d) { return x(d.hour) })
			.attr('y', function(d) { return y(d.day) })
			.attr('width', width/24)
			.attr('height', height/7)
			.attr('rx', 5)
			.attr('ry', 5)
			.style('fill', function(d) { return color(d.electric.average) })
	}

	return {
		draw: draw
	}
}






