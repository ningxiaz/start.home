$(function() {
	// var view = lockscreenView();

	// view.init();

	$('.inner-ring').on('mouseover touchstart', function() {
		$(this).addClass('active')
	}).on('mouseout touchend', function() {
		$(this).removeClass('active')
	})
})

function lockscreenView() {

	var active, fb, vis;

	function init() {
		active = false;
		fb = new Firebase('https://start-home.firebaseio.com');

		vis = ring()

		updateData();

		setInterval(updateData, 100000)

		function updateData() {
			var start = moment().startOf('day').subtract(5, 'm'),
				end = moment().endOf('day');

			fb.child('snapshots/all').startAt(+start).endAt(+end).once('value', function(snapshot) {
				snapshot = snapshot.val();

				var data = d3.values(snapshot)
				vis.update(data);
			})
		}
	}

	// expose the API
	return {
		init: init,
	}
}

function ring() {
	var selector = '#ring';

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

	// Radii
	var inner_radius = 100,
		outer_radius = 200;

	// scales
	var angle = d3.time.scale()
					.range([0, 2 * Math.PI]),
		radius = d3.scale.linear()
					.range([inner_radius, outer_radius]);

	var electric_scale = d3.scale.linear().range([0,1]),
		water_scale = d3.scale.linear().range([0,1]);

	// data
	var data = [];

	var sunrise, sunset;

	// graphics
	var svg = d3.select(selector).append('svg')
				.append('g')
				.attr('transform', 'translate('+width/2+', '+height/2+') rotate(180)');

	var area = d3.svg.area.radial()
					.interpolate("basis")
					.angle(function(d) { return angle(new Date(d.timestamp)) })
					.innerRadius(function(d) { return radius(d.y0) })
					.outerRadius(function(d) { return radius(d.y0 + d.y) })

	var line = d3.svg.line.radial()
					.interpolate("basis")
					.angle(function(d) { return angle(new Date(d.timestamp)) })
					.radius(function(d) { return radius(d.y0 + d.y) });

	// stack
	var stack = d3.layout.stack()
					.offset('zero')
					.values(function(d) { return d.values; })
					.x(function(d) { return d.timestamp; })
					.y(function(d) { return d.normal; });


	// this function should be called every time the data updates
	function update(new_data) {
		electric_scale.domain(d3.extent(new_data, function(d) { return d.electric.average; }))
		water_scale.domain(d3.extent(new_data, function(d) { return d.water.average; }))

		data = processData(new_data);

		var first = new_data[0],
			last = new_data[new_data.length - 1];

		var times = sun_times[moment().dayOfYear()];

		sunrise = moment(times.sunrise, 'Hm Z')
		sunset = moment(times.sunset, 'Hm Z')

		angle.domain([moment().startOf('day'), moment().endOf('day')])
		radius.domain([0, 1])

		stack(data)

		draw();
	}

	function processData(new_data) {
		return [
			{
				type: 'electric',
				values: new_data.map(function(d) { 
					var response = d.electric; 
					response.timestamp = d.timestamp;
					response.normal = electric_scale(d.electric.average);

					return response;
				})
			},
			{
				type: 'water',
				values: new_data.map(function(d) {
					var response = d.water; 
					response.timestamp = d.timestamp;
					response.normal = water_scale(d.water.average);

					return response;
				})
			}
		]
	}

	// draws the graph!
	function draw() {
		var layers = svg.selectAll('.layer')
			.data(data);

		layers.enter().append('path')
			.attr('class', function(d) { return 'area layer ' + d.type; })

		layers
			.attr('d', function(d) { return area(d.values) });

		// var day_arc = d3.svg.arc()
		// 	.innerRadius(outer_radius)
		// 	.outerRadius(outer_radius + 20)
		// 	.startAngle(angle(sunrise))
		// 	.endAngle(angle(sunset))

		// var night_arc = d3.svg.arc()
		// 	.innerRadius(outer_radius)
		// 	.outerRadius(outer_radius + 20)
		// 	.startAngle(angle(sunset))
		// 	.endAngle(angle(sunrise))

		// svg.append('path')
		// 	.attr('d', day_arc)

		// svg.append('path')
		// 	.attr('d', night_arc)



		// var lines = svg.selectAll('.line')
		// 	.data(data);

		// lines.enter().append('path')
		// 	.attr('class', function(d) { return 'line ' + d.type; })

		// lines
		// 	.attr('d', function(d) { return line(d.values) });

	}

	// helper function to get the right type of data
	function getDatum(d, i) {
		if (i) return d['monitors'][i];
		return d['monitors'];
	}

	return {
		update: update,
		draw: draw,
		selector: selector
	}
}