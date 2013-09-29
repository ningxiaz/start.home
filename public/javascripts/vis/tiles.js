function tiles() {
	var selector = '#tiles';

	var monitors = config['monitors']['list'],
		controls = config['controls']['list'];

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
		data_metric = 'average',
		detail_data = {},
		detail_data_index = 0,
		start_date,
		end_date;

	// graphics
	var svg = d3.select(selector + ' svg')
		// .on('touchstart', touch)
		// .on('touchmove', touch)
		// .on('touchend', touch);

	var detail_text, time_span_text;

	var floorplan = miniFloorplan();

	init()

	// this function should be called every time the data updates
	function update(new_data) {

		var temp = d3.values(new_data)

		var start = new Date(temp[0].timestamp),
			end = new Date(temp[temp.length - 1].timestamp);

		start_date = start;
		end_date = end;

		data = processData(new_data);

		// we sort the data by rows and columns so d3's binding doesn't get
		// confused... it's kind of silly
		// data.sort(function (a,b) {
		// 	var dx = x(a.hour) - x(b.hour),
		// 		dy = y(a.day) - y(b.day);

		// 	if (dx == 0) return dy;

		// 	return dx;
		// });

		if (!detail_data) setDetail(0);

		draw();
		drawDetail();
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
						foliage: leaves.map(function(d) {
							return {
								monitors: d.monitors,
								controls: d.controls,
								timestamp: d.timestamp
							}
						})
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
				var day, hour, electric, water, foliage;

				day = data.get(tile.day);
				if (day) hour = day.get(tile.hour);

				if (hour) {
					electric = hour['electric'];
					water = hour['water'];
					foliage = hour['foliage'];
				}

				return {
					day: tile.day,
					hour: tile.hour,
					electric: electric,
					water: water,
					foliage: foliage,
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

		var legend = svg.append('g')
			.attr('class', 'legend')
			.attr('transform', 'translate('+(margin.left)+','+(gridSize * 7 + gridSize/2 + 20)+')')

		var colorSize = 20;

		var colors = legend.selectAll('.color')
			.data(colorbrewer.Spectral[9].reverse())

		colors.enter().append('rect')
			.attr('fill', function(d) { return d })
			.attr('x', function(d,i) { return i * colorSize + 2})
			.attr('width', colorSize - 2)
			.attr('height', colorSize - 2)
			.attr('rx', 3)
			.attr('ry', 3)

		legend.append('text')
			.attr('class', 'legend-text')
			.attr('x', -gutter)
			.attr('y', colorSize / 2 + 3)
			.attr('width', colorSize * 9)
			.attr('text-anchor', 'end')
			.text('less')

		legend.append('text')
			.attr('class', 'legend-text')
			.attr('x', colorSize * 9 + 4)
			.attr('y', colorSize / 2 + 3)
			.attr('text-anchor', 'start')
			.text('more consumption')

		var details = svg.append('g')
			.attr('id', 'details')
			.attr('transform', 'translate('+(margin.left)+','+(gridSize * 7 + gridSize/2)+')')

		detail_text = details.append('text')
			.attr('class', 'detail-title')
			.attr('y', 35)
			.attr('x', vis_width/2)
			.attr('text-anchor', 'middle')
			.text('Tap the tiles for details')

		time_span_text = details.append('text')
			.attr('class', 'axis-text')
			.attr('text-anchor', 'end')
			.attr('y', colorSize / 2 + 3 + 20)
			.attr('x', vis_width - 2)

		draw()
	}

	// draws the graph!
	function draw() {
		color.domain(d3.extent(data, function(d) { return getDatum(d) }))
		time_span_text.text('aggregate from ' + moment(start_date).format('h:mma on M/D') + ' to ' + moment(end_date).format('h:mma on M/D'))

		var heatMap = svg.selectAll('.hour')
			.data(data)

		heatMap.attr('class', 'hour update')

		heatMap.enter().append('svg:rect')
			.attr('class', 'hour enter')
			.attr('id', function(d) { return 'hour-' + d.day + '-' + d.hour })
			.attr('rx', 100)
			.attr('ry', 100)
			.attr('transform', 'translate('+(margin.left + gridSize / 2)+','+(margin.top + gridSize / 2)+')')
			.attr('x', function(d) { return x(d.hour) + gutter/2 })
			.attr('y', function(d) { return y(d.day) + gutter/2 })
			.attr('width', 0)
			.attr('height', 0)
			.on('touchstart', setDetail)
			.on('mouseover', setDetail)
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

		drawDetail();
			
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

	function drawDetail() {
		detail_data = data[detail_data_index]
		var c = [],
			m = []

		if (detail_data.foliage) {
			c = d3.transpose(detail_data.foliage.map(function(d) { 
				return d.controls
			}))
			m = d3.transpose(detail_data.foliage.map(function(d) { 
				return d.monitors
			}))
		}
		var aggregate = {
			monitors: c.map(function(d, i) {
				return {
					device: monitors[i],
					value: d3.mean(d) 
				}
			}),
			controls: m.map(function(d, i) { 
				return {
					device: controls[i],
					value: d3.mean(d)
				}
			})
		}

		aggregate.monitors = aggregate.monitors.filter(function(d) {
			return d.device.metric == data_type;
		})

		console.log(aggregate)

		var control_scale = d3.scale.linear()
			.range([0, vis_width])
			.domain([0, d3.sum(aggregate.controls, function(d) { return d.value; })])

		var monitor_scale = d3.scale.linear()
			.range([0, vis_width])
			.domain([0, d3.sum(aggregate.monitors, function(d) { return d.value; })])

		var monitor_color = d3.scale.ordinal()
				.domain(monitors.map(function(m) { return m.slug; }))
				.range(colorbrewer.Set2[8])

		var details = svg.select('#details');

		detail_text.text(detail_data.day + 's at ' + detail_data.hour)

		svg.selectAll('.hour').attr('stroke', 'none')

		d3.select('#hour-' + detail_data.day + '-' + detail_data.hour)
			.attr('stroke', '#39474C')
			.attr('stroke-width', '2px')

		details.selectAll('.top-five-control')
			.data()

		var monitor_line = details.selectAll('.monitor_line')
			.data(aggregate.monitors, function(d) { return d.device.slug; });

		monitor_line.enter().append('line')
			.attr('class', 'monitor_line')
			.attr('y1', 60)
			.attr('y2', 60)
			.attr('x1', 0)
			.attr('x2', 0)
			.attr('stroke-width', 20)

		monitor_line
			.attr('stroke', function(d) { return monitor_color(d.device.slug) })
			.transition()
			.attr('x1', function(d, i) { return monitor_scale(sum(aggregate.monitors, i)) })
			.attr('x2', function(d, i) { return monitor_scale(sum(aggregate.monitors, i) + d.value) })

		var title_text = details.selectAll('.title_text')
			.data(aggregate.monitors, function(d) { return d.device.slug; });

		title_text.enter().append('text')
			.attr('class', 'title_text')
			.attr('y', 85)
			.attr('x', 0)

		title_text
			.attr('fill', function(d) { return monitor_color(d.device.slug) })
			.transition()
			.attr('x', function(d, i) { return monitor_scale(sum(aggregate.monitors, i)) + 2 })
			.text(function(d) { 
				if (monitor_scale(d.value) < 120) return '' 
				return d.device.title 
			})

		var value_text = details.selectAll('.value_text')
			.data(aggregate.monitors, function(d) { return d.device.slug; });

		value_text.enter().append('text')
			.attr('class', 'value_text axis-text')
			.attr('y', 85)
			.attr('text-anchor', 'end')
			.attr('x', 0)

		value_text
			.transition()
			.attr('x', function(d, i) { return monitor_scale(sum(aggregate.monitors, i) + d.value) - 2 })
			// .attr('fill', function(d) { return monitor_color(d.device.slug) })
			.text(function(d) { 
				if (monitor_scale(d.value) < 140) return '' 
				return Math.round((d.value / sum(aggregate.monitors, aggregate.monitors.length)) * 100) + '%';
			})

		monitor_line.exit()
			.transition()
			.attr('x1', vis_width)
			.attr('x2', vis_width)
			.remove()

		title_text.exit()
			.transition()
			.attr('x', vis_width)
			.remove()

		value_text.exit()
			.transition()
			.attr('x', vis_width)
			.remove()

		floorplan.update(aggregate.monitors, monitor_color)
	}

	function sum(l, i) {
		return d3.sum(l.slice(0,i), function(d) { return d.value; })
	}

	// function touch() {
	// 	console.log(d3.touches(svg.node()))
	// }

	function setDetail(d, i) {
		detail_data_index = i;

		drawDetail();
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

function miniFloorplan() {
	// selector
	var selector = "#mini-floorplan svg";

	// dimensions
	var width  = $(selector).width(),
		height = $(selector).height(),
		border_height = 26,
		border_radius = 5;

	// data
	var monitor_data = [],
		control_data = [];

	// scales
	var color = d3.scale.category10()

	// graphics
	var svg = d3.select(selector).append('g');

	var min_radius = 5,
		max_radius = 20;

	function update(new_data, colors) {
		monitor_data = new_data;
		color = colors;
		draw();
	}

	function draw() {
		var monitors = svg.selectAll('.monitor')
			.data(monitor_data, function(d) { return d.device.slug; });

		// var controls = svg.selectAll('.control')
		// 	.data(control_data);

		monitors.enter().append('circle')
			.attr('class', function(d) { return 'monitor node'; })
			.attr('cx', function(d) { return d.device.x })
			.attr('cy', function(d) { return d.device.y })
			.attr('r', 0)
			.attr('fill', function(d) { return color(d.device.slug) })
			// .attr('stroke', function(d) { return color(d.device.type) })

		monitors
			.transition()
			.duration(500)
			.attr('r', function(d) { 
				// funky syntax, I know...
				// return d3.scale.linear()
				// 	.range([min_radius,max_radius])
				// 	.domain([d.device.min, d.device.max])
				// 	(d.value) * 5
				return d.value * 50
			})

		monitors.exit()
			.transition()
			.attr('r', 0)
			.remove()


		// controls.enter().append('circle')
		// 	.attr('class', function(d) { return 'control node electric ' + d.type; })
		// 	.attr('stroke', function(d) { return color(d.type) })

		// controls
		// 	.transition()
		// 	.duration(500)
		// 	.attr('r', function(d) {
		// 		return d3.scale.linear()
		// 			.range([min_radius,max_radius])
		// 			.domain([d.min, d.max])
		// 			(d.value)
		// 	})
		// 	.attr('cx', function(d) { return d.device.x })
		// 	.attr('cy', function(d) { return d.device.y })



	}

	return {
		update: update
	}
}