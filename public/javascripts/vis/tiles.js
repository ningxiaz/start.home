function tiles() {
	var selector = '#tiles';

	// dimensions
	var width  = $(selector).width(),
		height = $(selector).height();

	// margins
	var margin = {
		top: 30,
		bottom: 0,
		left: 60,
		right: 30
	}

	var vis_width = width - margin.left - margin.right,
		vis_height = height - margin.top - margin.bottom;

	// grid
	var gridSize = vis_width / 24,
		gutter = 3,
		cornerRadius = 5;

	// domains
	var hours = ['12am', '1am', '2am', '3am', '4am', '5am', '6am', '7am', '8am', '9am', '10am', '11am', '12pm', '1pm', '2pm', '3pm', '4pm', '5pm', '6pm', '7pm', '8pm', '9pm', '10pm', '11pm'],
		days  = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

	// scales
	var x = d3.scale.ordinal()
				.domain(hours)
				.rangePoints([0, gridSize * 23]),
		y = d3.scale.ordinal()
				.domain(days)
				.rangePoints([0, gridSize * 6]),
		color = d3.scale.quantile()
					.range(colorbrewer.Spectral[9]);

	// data
	var data = [],
		data_type = 'electric',
		data_metric = 'average';

	// graphics
	var svg = d3.select(selector).append('svg');

	init()

	// this function should be called every time the data updates
	function update(new_data) {

		data = processData(new_data);

		// we sort the data by rows and columns so d3's binding doesn't get
		// confused... it's kind of silly
		// data.sort(function (a,b) {
		// 	var dx = x(a.hour) - x(b.hour),
		// 		dy = y(a.day) - y(b.day);

		// 	if (dx == 0) return dy;

		// 	return dx;
		// });

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
				.map(d3.values(new_data), d3.map);

			NProgress.inc() // progress!

			var rect_data = [];
			days.forEach(function(day) {
				hours.forEach(function(hour) {
					rect_data.push({
						day: day,
						hour: hour
					})
				})
			})

			return rect_data.map(function(tile) {
				var day, hour, electric, water;

				day = data.get(tile.day);
				if (day) hour = day.get(tile.hour);

				if (hour) {
					electric = hour['electric'],
					water = hour['water']
				}

				return {
					day: tile.day,
					hour: tile.hour,
					electric: electric,
					water: water
				}
			})
	}

	function init() {
		var rect_data = [];
		days.forEach(function(day) {
			hours.forEach(function(hour) {
				rect_data.push({
					day: day,
					hour: hour,
					electric: null,
					water: null
				})
			})
		})

		data = rect_data;

		var dayLabels = svg.selectAll('.day-label')
			.data(days)

		dayLabels.enter().append('text')
			.attr('class', 'axis-text day-label')
			.attr('transform', function(d) { return 'translate('+(margin.left - gutter*2 )+','+(margin.top + y(d) + gridSize/2 + gutter)+')' })
			.style('text-anchor', 'end')
			.text(function(d) { return d.substring(0,3); })

		var hourLabels = svg.selectAll('.hour-label')
			.data(hours)

		hourLabels.enter().append('text')
			.attr('class', 'axis-text hour-label')
			.attr('transform', function(d) { return 'translate('+(margin.left + 30 + x(d) - gutter)+','+(margin.top - gutter*2)+')' })
			.style('text-anchor', 'middle')
			.text(function(d) { return d; })

		draw()
	}

	// draws the graph!
	function draw() {
		color.domain(d3.extent(data, function(d) { return getDatum(d) }))

		var heatMap = svg.selectAll('.hour')
			.data(data)

		heatMap.attr('class', 'hour update')

		heatMap.enter().append('rect')
			.attr('class', 'hour enter')
			.attr('rx', 100)
			.attr('ry', 100)
			.attr('transform', 'translate('+(margin.left + gridSize / 2)+','+(margin.top + gridSize / 2)+')')
			.attr('x', function(d) { return x(d.hour) + gutter/2 })
			.attr('y', function(d) { return y(d.day) + gutter/2 })
			.attr('width', 0)
			.attr('height', 0)
			.transition()
				.duration(1000)
				.delay(function(d,i) { return (x(d.hour) + y(d.day))/5; })
				.attr('x', function(d) { return x(d.hour) + gutter/2 - gridSize/2 })
				.attr('y', function(d) { return y(d.day) + gutter/2 - gridSize/2})
				.attr('width', gridSize - gutter)
				.attr('height', gridSize - gutter)
				.attr('rx', cornerRadius)
				.attr('ry', cornerRadius)

		heatMap
			.transition()
				.duration(500)
				.delay(function(d,i) { return (x(d.hour) + y(d.day))/5; })
				.attr('x', function(d) { return x(d.hour) + gutter/2 - gridSize/2 })
				.attr('y', function(d) { return y(d.day) + gutter/2 - gridSize/2})
				.attr('width', gridSize - gutter)
				.attr('height', gridSize - gutter)
				.attr('rx', cornerRadius)
				.attr('ry', cornerRadius)
				.style('fill', function(d) { 
					var datum = getDatum(d);
					if (datum) return color(datum); 
					return '#D2E0E5';
				})
			
		// heatMap.exit()
		// 	.transition()
		// 		.duration(500)
		// 		.delay(function(d,i) { return (x(d.hour) + y(d.day))/5; })
		// 		.attr('x', function(d) { return x(d.hour) + gutter/2 })
		// 		.attr('y', function(d) { return y(d.day) + gutter/2 })
		// 		.attr('width', 0)
		// 		.attr('height', 0)
		// 		.attr('rx', 100)
		// 		.attr('ry', 100)
		// 		.remove()
	}

	// updates the data accessors
	// like water vs. electric
	function setAccessors(type, metric, redraw) {
		// robustness
		if (type   != 'electric' && type   != 'water')   return;
		if (metric != 'total'    && metric != 'average') return;

		data_type = type;
		data_metric = metric;

		// update the visualization!
		if (redraw) draw();
	}

	// helper function to get the right type of data
	function getDatum(d) {
		if (d[data_type]) return d[data_type][data_metric];
		return null;
	}

	return {
		update: update,
		draw: draw,
		set: setAccessors,
		selector: selector
	}
}