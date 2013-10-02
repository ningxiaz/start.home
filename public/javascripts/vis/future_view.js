// This code happens in angular
// $(function() {
// 	var view = futureView();

// 	view.init();
// })

function futureView() {

	var fb,          // base Firebase ref
		vis,         // map of visualizations
		active_vis,  // active visualization
		start,       // start date for data query
		end,         // end date for data query
		data_type,   // 'electric' or 'water'
		data_metric; // 'average' or 'total'

	function init(goalFunc) {
		console.log("Initializing future view")

		fb = new Firebase(config['firebase_url']);

		vis = {
			'future': future(goalFunc),
		};

		data_metric = 'total';

		fb.child('snapshots/all').limit(500).on('value', function(snapshot) {
			snapshot = snapshot.val();

			var data = d3.values(snapshot)

			vis['future'].update(data);
		})

		$('a[data-toggle="pill"]').on('shown.bs.tab', function (e) {
			var new_metric = $(e.target).data('metric');

			vis['future'].metric(new_metric, true);
		})

		return {
			goal: vis['future'].goal,
			projection: vis['future'].projection
		}
	}

	// expose the API
	return {
		init: init,
	}
}

function future(goalFunc) {
	// selector
	var selector = "#future";

	// dimensions
	var width  = $(selector).width(),
		height = $(selector).height(),
		border_height = 26,
		border_radius = 5,
		control_gutter_width = 30;

	// margins
	var margin = {
		top: 300,
		bottom: 300,
		left: 0,
		right: 0
	}

	var vis_width = width - margin.left - margin.right,
		vis_height = height - margin.top - margin.bottom;

	// data
	var data;

	var monitors = config.monitors.list;

	var data_metric = 'electric',
		data_type = 'total';

	var projection = 0,
		goal = {
			electric: 0,
			water: 0
		}

	// scales
	var x = d3.time.scale()
				.range([0, vis_width]),
		y = d3.scale.linear()
				.range([vis_height, 0]);

	// graphics
	var svg = d3.select(selector).append('svg')

	var line = d3.svg.line()
					.interpolate("none")
					.x(function(d) { return x(new Date(d.timestamp)) })
					.y(function(d) { return y(getDatum(d)) });

	var gutter = svg.append('line')
		.attr('class', 'gutter')
		.attr('x1', width - control_gutter_width/2)
		.attr('x2', width - control_gutter_width/2)
		.attr('y1', 0)
		.attr('y2', height)
		.attr('stroke-width', control_gutter_width)


	svg = svg.append('g')
				.attr('transform', 'translate('+margin.left+','+margin.top+')');

	var projection_line = svg.append('line')
		.attr('class', 'projection')

	var projection_circle = svg.append('circle')
		.attr('class', 'projection-circle')
		.attr('r', control_gutter_width/2 - 6)

	var goal_line = svg.append('line')
		.attr('class', 'goal')

	var goal_circle = svg.append('circle')
		.attr('class', 'goal-circle')
		.attr('r', control_gutter_width/2 - 3)
		
	var original = 0;

	Hammer($('.goal-circle')).on('dragstart', function(e) {
		original = getGoal();
	})

	Hammer($('.goal-circle')).on('drag', function(e) {
		e.gesture.preventDefault();
		e.gesture.stopPropagation();

		goal[data_metric] = y.invert(y(original) + e.gesture.deltaY);
		
		goalFunc(goal);
		draw();
	})

	Hammer($('.goal-circle')).on('release', function(e) {
		e.gesture.preventDefault();
		e.gesture.stopPropagation();

		goal[data_metric] = y.invert(y(original) + e.gesture.deltaY);

		goalFunc(goal);
		draw();
	})

	var goal_label = svg.append('text')
		.attr('class', 'goal-label')
		.text('Goal')



	// var goal_line = d3.svg.line()
	// 				.interpolate("basis")
	// 				.x(function(d) { return x(new Date(d.timestamp)) })
	// 				.y(function(d) { return y(getDatum(d)) });

	function update(new_data) {
		
		if (new_data) data = new_data;
		
		var first = new Date(data[0].timestamp),
			last = moment(data[data.length-1].timestamp).add(5, 'd');

		x.domain([first, last])
		y.domain(d3.extent(data, function(d) { return getDatum(d); }))

		draw();
	}

	function draw() {
		var main_line = svg.selectAll('.main-line')
			.data([data]);

		main_line.enter().append('path')
			.attr('class', 'line main-line')

		main_line
			.attr('d', line)

		var end_point = svg.selectAll('.end-point')
			.data([data[data.length - 1]])

		end_point.enter().append('circle')
			.attr('class', 'end-point')
			.attr('r', 10)

		end_point
			.attr('cx', function(d) { return x(new Date(d.timestamp)); })
			.attr('cy', function(d) { return y(getDatum(d)); })

		var last = data[data.length - 1];

		var p_data = {
			x1: x(new Date(last.timestamp)),
			x2: vis_width - control_gutter_width/2,
			y1: y(getDatum(last)),
			y2: y(getProjection())
		}

		projection_line
			.attr('x1', p_data.x1)
			.attr('x2', p_data.x2)
			.attr('y1', p_data.y1)
			.attr('y2', p_data.y2)

		projection_circle
			.attr('cx', p_data.x2)
			.attr('cy', p_data.y2)

		goal_line
			.attr('x1', 0)
			.attr('x2', vis_width)
			.attr('y1', y(getGoal()))
			.attr('y2', y(getGoal()))

		goal_circle
			.attr('cx', vis_width - control_gutter_width/2)
			.attr('cy', y(getGoal()))

		goal_label
			.attr('transform', 'translate('+(vis_width - 80)+','+(y(getGoal()) - 10)+')');
	}

	function updateProjection(new_projection, redraw) {
		projection = new_projection;

		if (redraw && data) draw();
	}

	function updateGoal(new_goal, redraw) {
		goal = new_goal;

		console.log(goal)
		
		if (redraw && data) draw();
	}

	function setMetric(new_metric, redraw) {
		data_metric = new_metric;

		if (redraw) {
			update();
			draw();
		}
	}

	function getDatum(d) {
		return d[data_metric][data_type]
	}

	function getGoal() {
		return goal[data_metric];
	}

	function getProjection() {
		return projection[data_metric];
	}

	return {
		update: update,
		projection: updateProjection,
		goal: updateGoal,
		metric: setMetric
	}
}





