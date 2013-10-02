$(function() {
	var view = presentView();

	view.init();

	$('.pane-container').on('segue', function(e, state) {
		if (state == 1) view.activate();
		else view.deactivate();
	}) 

	$('#three').click(function() {
		$(this).toggleClass('focused')
	})
})

function presentView() {

	var active, fb, vis;

	function init() {
		console.log("Initializing present view")

		active = false;
		fb = new Firebase(config['firebase_url']);

		vis = {
			three: three(),
			floorplan: mainFloorplan()
		};

		fb.child('snapshots/all').limit(18).on('value', function(snapshot) {
			snapshot = snapshot.val();

			var data = d3.values(snapshot)
			vis.three.update(data);
		})

		// fb.child('controls').on('value', function(snapshot) {
		// 	snapshot = snapshot.val();

		// 	var data = snapshot.list;
		// 	vis.floorplan.update_controls(data)
		// })

		fb.child('monitors').on('value', function(snapshot) {
			snapshot = snapshot.val();

			var data = snapshot.list;
			vis.floorplan.update(data)
		})

		// fb.child('')

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

	// selector
	var selector = "#three";

	// dimensions
	var width  = $(selector).width(),
		height = $(selector).height(),
		border_height = 26,
		border_radius = 5;

	// margins
	var margin = {
		top: 20,
		bottom: 20,
		left: 30,
		right: 30
	}

	var vis_width = width - margin.left - margin.right,
		vis_height = height;

	// scales
	var x  = d3.time.scale().range([margin.left, width - margin.right]),
		y  = d3.scale.linear().range([height - border_height, 0]),
		water_scale = d3.scale.linear().range([0,1]),
		electric_scale = d3.scale.linear().range([0,1]);

	// graphics 
	// The clipping box is for rounding the corners while allowing
	// the max and min bubbles
	var svg = d3.select(selector).append('svg')
				.attr('width', width)
				.attr('height', height);
		
		svg.append('defs').append('svg:clipPath')
					.attr('id', 'clip')
				.append('svg:rect')
					.attr('x', margin.left)
					.attr('width', vis_width)
					.attr('height', vis_height)
					.attr('rx', border_radius)
					.attr('ry', border_radius);

	var	shapes = svg.append('g')
					.attr('clip-path', 'url(#clip)');

		shapes.append('svg:rect')
			.attr('class', 'box')
			.attr('x', margin.left)
			.attr('width', vis_width)
			.attr('height', vis_height)

	var	bottom_border = shapes.append('rect')
							.attr('class', 'axis')
							.attr('width', vis_width)
							.attr('height', border_height)
							.attr('transform', 'translate('+margin.left+','+(height-border_height)+')');


	var stack = d3.layout.stack()
					.offset('zero')
					.values(function(d) { return d.values; })
					.x(function(d) { return d.timestamp; })
					.y(function(d) { return d.normal; });

	// data
	var circle_data = [],
		data = [];

	// animation
	var transition_duration = 500;

	var electric_area = d3.svg.area()
					.interpolate("basis")
					.x(function(d) { return x(new Date(d.timestamp)); })
					.y(function(d) { return 0; })
					.y1(function(d) { return vis_height - y(electric_scale(d.electric.average)); })

	var water_area = d3.svg.area()
					.interpolate("basis")
					.x(function(d) { return x(new Date(d.timestamp)); })
					.y(function(d) { return y(water_scale(d.water.average)); })
					.y1(function(d) { return vis_height - border_height; })			

	var line = d3.svg.line()
					.interpolate("basis")
					.x(function(d) { return x(new Date(d.timestamp)) })
					.y(function(d) { return y(d.y0 + d.y) });

	// axes
	var xAxis = d3.svg.axis()
					.orient('top')
					.scale(x);

	var axis = svg.append('g')
		.attr("transform", "translate(0," + height + ")")
		.attr('class', 'x axis no-domain');


	function update(new_data) {
		// electric_scale.domain([0, d3.max(new_data, function(d) { return d.electric.average; })])
		// water_scale.domain([0, d3.max(new_data, function(d) { return d.water.average; })])

		electric_scale.domain(d3.extent(new_data, function(d) { return d.electric.average; }))
		water_scale.domain(d3.extent(new_data, function(d) { return d.water.average; }))

		data = new_data;

		var start = new Date(data[0].timestamp),
			end   = new Date(data[data.length-1].timestamp);

		x.domain([start,end])
		y.domain([0,3])

		// stack(layer_data)

		// circle_data = findExtrema(layer_data)

		draw();
	}

	function processData(new_data) {
		return [
			{
				type: 'water',
				values: new_data.map(function(d) {
					var response = d.water; 
					response.timestamp = d.timestamp;
					response.normal = water_scale(d.water.average);

					return response;
				})
			},
			{
				type: 'electric',
				values: new_data.map(function(d) { 
					var response = d.electric; 
					response.timestamp = d.timestamp;
					response.normal = electric_scale(d.electric.average);

					return response;
				})
			}
		]
	}

	function findExtrema(new_data) {
		var num_extrema = 2;
		var extrema = [];

		// min
		new_data.forEach(function(layer) {
			var vals = [];
			layer.values.forEach(function(d) {
				var datum = $.extend({}, d);
				datum.type = layer.type;
				datum.extrema_type = 'min'

				vals.push(datum);

				vals.sort(function(a,b) { return a.average - b.average; })
				if (vals.length > num_extrema) vals.pop()
			})

			extrema = d3.merge([extrema, vals]);
		})

		// max
		new_data.forEach(function(layer) {
			var vals = [];
			layer.values.forEach(function(d) {
				var datum = $.extend({}, d);
				datum.type = layer.type;
				datum.extrema_type = 'max'

				vals.push(datum);

				vals.sort(function(a,b) { return b.average - a.average; })
				if (vals.length > num_extrema) vals.pop()
			})

			extrema = d3.merge([extrema, vals]);
		})

		return extrema;
	}

	function draw() {
		var e_area = shapes.selectAll('.electric.area')
				.data([data]);

		var w_area = shapes.selectAll('.water.area')
				.data([data]);

		e_area.enter().append('path')
			.attr('class', 'electric area')

		w_area.enter().append('path')
			.attr('class', 'water area')

		e_area.attr('d', electric_area)

		w_area.attr('d', water_area)


		axis.call(xAxis)

		// axes.x
		// 	.call(xAxis)

		// axes.y1
		// 	.call(y1Axis)
	}

	return {
		update: update,
	}
}

function mainFloorplan() {
	// selector
	var selector = "#main-floorplan svg";

	// dimensions
	var width  = $(selector).width(),
		height = $(selector).height(),
		border_height = 26,
		border_radius = 5;

	// margins
	var margin = {
		top: 20,
		bottom: 20,
		left: 30,
		right: 30
	}

	var vis_width = width - margin.left - margin.right,
		vis_height = height;

	// data
	var monitor_data = [],
		control_data = [];

	// scales
	var color = d3.scale.category10()

	// graphics
	var svg = d3.select(selector).append('g');

	var min_radius = 5,
		max_radius = 20;

	function update(new_data) {
		monitor_data = new_data;
		draw();
	}

	function draw() {
		var monitor_circles = svg.selectAll('.monitor')
			.data(monitor_data);

		// var controls = svg.selectAll('.control')
		// 	.data(control_data);

		monitor_circles.enter().append('circle')
			.attr('id', function(d) { return 'monitor-' + d.slug; })
			.attr('class', function(d) { return 'monitor node ' + d.type + ' ' + d.metric; })
			.attr('stroke', 'rgba(0,0,0,0)')
			.style('stroke-width', 10)
			.on('mousedown', showLabel)
			.on('touchstart', showLabel)
			.on('mouseup', hideLabel)
			.on('touchend', hideLabel)
			// .attr('stroke', function(d) { return color(d.type) })

		monitor_circles
			.transition()
			.duration(500)
			.attr('cx', function(d) { return d.x })
			.attr('cy', function(d) { return d.y })
			.attr('r', function(d) { 
				// funky syntax, I know...
				return d3.scale.linear()
					.range([min_radius,max_radius])
					.domain([d.min, d.max])
					(d.value)
			})
		var sorted_electric = monitor_data.filter(function(d) { return d.metric == 'electric';})
		sorted_electric = sorted_electric.sort(function(a,b) { return b.value - a.value; })

		var sorted_water = monitor_data.filter(function(d) { return d.metric == 'water';})
		sorted_water = sorted_water.sort(function(a,b) { return b.value - a.value; })

		var e_consumers = d3.select('#electric-consumers').selectAll('.list-group-item')
			.data(sorted_electric.slice(0,3));

		e_consumers.enter().append('html:li')
			.attr('class', 'list-group-item')

		e_consumers
			.text(function(d) { return d.title })
			.append('span')
				.attr('class', 'badge')
				.text(function(d) { return Math.round(d.value * 100) / 100 + ' kW' })

		var w_consumers = d3.select('#water-consumers').selectAll('.list-group-item')
			.data(sorted_water.slice(0,3));

		w_consumers.enter().append('html:li')
			.attr('class', 'list-group-item')

		w_consumers
			.text(function(d) { return d.title })
			.append('span')
				.attr('class', 'badge')
				.text(function(d) { return Math.round(d.value * 100) / 100 + ' gal' })


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
		// 	.attr('cx', function(d) { return d.x })
		// 	.attr('cy', function(d) { return d.y })



	}

	function showLabel(d,i) {
		$('#monitor-' + d.slug).tooltip({
			title: d.title,
			container: '.pane-container'
		}).tooltip('show')
	}

	function hideLabel(d,i) {
		$('#monitor-' + d.slug).tooltip('destroy')
	}

	return {
		// update_controls: update_controls,
		update: update,
	}
}







