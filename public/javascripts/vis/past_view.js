
// Austin's thoughts on the past view:

// The past view is probably the most complicated panel because it has to
// handle a lot of data gracefully. Visualizations on the past view can go
// "stale" in the sense that they will only be updated once when they're drawn
// to the screen. This is important in minimizing costly Firebase API calls.

// The timeline provides brushing so we can let the users select a specific
// time period to focus on. We can use Firebase startAt and endAt queries to
// load the relevant data and we can then process it for the visualization.
// Updating the timeline will cause the active visualization to refresh.
// Though it would be nice to cache past data on the iPad, this is not a must-
// have feature yet (unless performance really takes a hit otherwise).

// I propose that we provide a simple "refresh" button once the visualization
// is considered "stale". I also think it is important that we make it obvious
// that the past view does not update in real time (by showing a little
// "Generated at 3 pm" sort of caption)

// Another UX issue is the timeline itself. Brushing is meant to happen in
// real time (brush domain updates -> focus domain updates), but we're loading
// data straight from Firebase. This means we want to wait until the user is
// done brushing in order to update the focus vis. I think a simple "Release
// to update" caption would be nice and unobtrusive.

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
		NProgress.start()

		active = false;
		fb = new Firebase('https://start-home.firebaseio.com');

		vis = {
			timeline: timeline(),
			tiles: tiles()
		};

		// keep the timeline up-to-date
		fb.child('snapshots/hourly').on('value', function(snapshot) {
			snapshot = snapshot.val();

			var data = d3.values(snapshot)
			vis.timeline.update(data);

			NProgress.inc()
		})

		fb.child('snapshots/all').limit(1500).once('value', function(snapshot) {
			snapshot = snapshot.val();

			NProgress.inc()

			vis.tiles.update(snapshot)

			NProgress.done()
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
    	.on("brushend", brushed);

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
			brush.extent([moment(end).subtract(7,'d'), end])
			brushed();
		}

		brush_shape
			.call(brush)
			.selectAll("rect")
				.attr("height", height);

		axes.x
			.call(xAxis)
	}

	function brushed() {
		console.log(brush.extent())
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
		left: 30,
		right: 30
	}

	var vis_width = width - margin.left - margin.right,
		vis_height = height - margin.top - margin.bottom;

	// grid
	var gridSize = vis_width / 24,
		gutter = 3,
		cornerRadius = 5;

	// scales
	var x = d3.scale.ordinal()
				.domain(['12am', '1am', '2am', '3am', '4am', '5am', '6am', '6am', '7am', '8am', '9am', '10am', '11am', 
					     '12pm', '1pm', '2pm', '3pm', '4pm', '5pm', '6pm', '6pm', '7pm', '8pm', '9pm', '10pm', '11pm'])
				.rangePoints([0, gridSize * 23]),
		y = d3.scale.ordinal()
				.domain(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'])
				.rangePoints([0, gridSize * 6]),
		color = d3.scale.quantile()
					.range(colorbrewer.Spectral[9]);

	// data
	var data = [],
		data_type = 'electric',
		data_metric = 'average';

	// graphics
	var svg = d3.select('#tiles').append('svg');

	// this function should be called every time the data updates
	function update(new_data) {
		data = processData(new_data);
		draw();
	}

	function processData(new_data) {
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
				.entries(d3.values(new_data));

			NProgress.inc() // progress!

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

			NProgress.inc() // a little more progress :)

			return d3.merge(data);
	}

	// draws the graph!
	function draw() {
		color.domain(d3.extent(data, function(d) { return getDatum(d) }))

		var heatMap = svg.selectAll('.hour')
			.data(data)
			.enter().append('rect')
			.attr('transform', 'translate('+(margin.left + gridSize / 2)+','+(margin.top + gridSize / 2)+')')
			.attr('x', function(d) { return x(d.hour) + gutter/2 })
			.attr('y', function(d) { return y(d.day) + gutter/2 })
			.attr('width', 0)
			.attr('height', 0)
			.attr('rx', 100)
			.attr('ry', 100)
			.style('fill', function(d) { return color(getDatum(d)) })
			.transition()
				.duration(500)
				.delay(function(d,i) { return (x(d.hour) + y(d.day))/5; })
				// .ease('elastic')
				.attr('x', function(d) { return x(d.hour) + gutter/2 - gridSize/2 })
				.attr('y', function(d) { return y(d.day) + gutter/2 - gridSize/2})
				.attr('width', gridSize - gutter)
				.attr('height', gridSize - gutter)
				.attr('rx', cornerRadius)
				.attr('ry', cornerRadius)
	}

	// updates the data accessors
	// like water vs. electric
	function setAccessors(type, metric) {
		// robustness
		if (type   != 'electric' || type   != 'water')   return;
		if (metric != 'total'    || metric != 'average') return;

		data_type = type;
		data_metric = metric;

		// update the visualization!
		draw();
	}

	// helper function to get the right type of data
	function getDatum(d) {
		return d[data_type][data_metric];
	}

	return {
		update: update,
		draw: draw,
		set: setAccessors
	}
}






