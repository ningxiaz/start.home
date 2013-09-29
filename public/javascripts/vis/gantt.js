function gantt() {
	var selector = '#gantt';

	var monitors = config['monitors']['list'],
		controls = config['controls']['list'];

	// dimensions
	var width  = $(selector).width(),
		height = $(selector).height();

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
	var gridSize = vis_height / 8,
		gutter = 3,
		cornerRadius = 3;

	// scales
	var row = d3.scale.linear()
				.domain([0, monitors.length])
				.range([0, gridSize * 6]),
		y = d3.scale.linear()
				.range([gutter, gridSize - gutter]),
		x = d3.time.scale()
				.range([0, vis_width]);
		color = d3.scale.ordinal()
				.domain(monitors.map(function(m) { return m.slug; }))
				.range(colorbrewer.Set2[8])

	// data
	var data = [],
		unprocessed_data = [],
		data_type = 'electric',
		data_metric = 'average',
		room_filters = [],
		source_filters = [];

	// graphics
	var svg = d3.select(selector).append('svg');

	var area = d3.svg.area()
		.interpolate('basis')
		.x(function(d) { return x(new Date(d.timestamp)); })
		.y0(function(d) { return -1 * y(d.val) })
		.y1(function(d) { return y(d.val) })


	// this function should be called every time the data updates
	function update(new_data) {
		unprocessed_data = new_data;
		data = processData(new_data);

		var first = new Date(data[0][0].timestamp),
			last = new Date(data[0][data[0].length-1].timestamp);

		x.domain([first, last])

		draw();
	}

	function processData(new_data) {
		// transposes the monitor stats so that we have a 2d array where each
		// column is the list of stats for a particular monitor

		// basically:
		// [snapshot, snapshot, snapshot...] -> [[stat1, stat1, stat1...], [stat2, stat2, stat2...]]

		return d3.transpose(d3.values(new_data).map(function(d, i) {
			return getDatum(d).map(function(e) {
				return {
					val: e,
					timestamp: d.timestamp
				}
			});
		}))

		// .filter(function(d, i) {
		// 	if (room_filters) {
		// 		return room_filters.indexOf(controls[i].room) >= 0;
		// 	}

		// 	return true;
		// })
	}

	// draws the graph!
	function draw() {
		// for (var i = 0; i < 8; i++) {
			y.domain([0,40]);

			var streak = svg.selectAll('.streak')
				.data(data);

			streak.enter().append('path')
				.attr('class', 'streak enter')
				.attr('transform', function(d,i) { return 'translate('+margin.left+', '+(row(i) + margin.top + gridSize/2)+')' })

			streak
				.style('fill', function(d,i) { return color(i) })
				.attr('d', area)

			var labels = svg.selectAll('.label')
				.data(data)

			labels.enter().append('text')
				.attr('class', 'label')
				.attr('transform', function(d,i) { return 'translate('+margin.left+', '+(row(i) + margin.top + gridSize)+')' })
				.text(function(d, i) { return controls[i].title })
				.style('fill', function(d,i) { return color(i) })

		// 	streak
		// 		.append('path')


		// };
	}

	// updates the data accessors
	// like water vs. electric
	function setAccessors(type, metric, redraw) {
		// robustness
		if (type   != 'electric' || type   != 'water')   return;
		if (metric != 'total'    || metric != 'average') return;

		data_type = type;
		data_metric = metric;
		room_filters = r_filters;
		source_filters = s_filters;

		// update the visualization!
		if (redraw) {
			update(unprocessed_data);
			draw();
		}
	}

	// helper function to get the right type of data
	function getDatum(d, i) {
		if (i) return d['controls'][i];
		return d['controls'];
	}

	return {
		update: update,
		draw: draw,
		set: setAccessors,
		selector: selector
	}
}