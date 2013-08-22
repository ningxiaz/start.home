// Goal view controls
$(function() {
	$('.set_goal').hide();

	$('.set_hvac').on('touchmove', function(e) {
		e.stopPropagation();
	})
})

// used for making array of dates for goals
function dateRange(start, end) {
    var range = [];

    start = start.clone();

    var count = moment.duration(end - start).asDays();

    for (var i = 0; i <= count; i++) {
        range.push(start.clone());
        start.add(1, 'd');
    };

    return range;
}

// Goal view visuals
var goal_view = {
	data: [],
	goal_data: [],

	height: 100,
	width: 100,
	margin: {
		left: 0,
		right: 360,
		top: 30,
		bottom: 120,	
	},

	scales: {
		x: d3.time.scale(),
		water: d3.scale.linear(),
		electric: d3.scale.linear()
	},

	lines: {
		electricity: {
			past: d3.svg.line(),
			goal: d3.svg.line()
		},
		water: {
			past: d3.svg.line(),
			goal: d3.svg.line()
		}
	},

	paths: {
		electricity: {
			past: null,
			goal: null
		},
		water: {
			past: null,
			goal: null
		}
	},

	axes: {
		x: d3.svg.axis(),
		water: d3.svg.axis(),
		electric: d3.svg.axis()
	},

	init: function() {
		this.width 	= $('.goal-view figure').width();
		this.height = $('.goal-view figure').height();

		var	margin = this.margin,
			scales = this.scales,
			lines  = this.lines,
			paths  = this.paths,
			axes   = this.axes;

		scales.x
			.range([margin.left, this.width - margin.right]);

		scales.electric
			.range([this.height - margin.bottom, margin.top]);

		scales.water
			.range([this.height - margin.bottom, margin.top]);

		lines.electricity.past
			// .interpolate('basis')
			.x(function(d) { return scales.x(new Date(d.timestamp)) })
			.y(function(d) { return scales.electric(d.electric.average) });

		lines.electricity.goal
			.interpolate('basis')
			.x(function(d) { return scales.x(new Date(d.timestamp)) })
			.y(function(d) { return scales.electric(d.electric) });

		lines.water.past
			// .interpolate('basis')
			.x(function(d) { return scales.x(new Date(d.timestamp)) })
			.y(function(d) { return scales.water(d.water.average) });

		lines.water.goal
			.interpolate('basis')
			.x(function(d) { return scales.x(new Date(d.timestamp)) })
			.y(function(d) { return scales.water(d.water) });

		axes.electric
			.scale(scales.electric)
			.orient('left');

		axes.water
			.scale(scales.water)
			.orient('right');

		axes.x
			.ticks(d3.time.days, 1)
			.scale(scales.x)
			.orient('top');
	},

	draw: function() {
		var svg = d3.select('.goal-view figure').append('svg');

		// a marker-end
		svg.append("marker")
			.attr("id", "blue-circle")
			.attr("refX", 7) /*must be smarter way to calculate shift*/
			.attr("refY", 7)
			.attr("markerWidth", 14)
			.attr("markerHeight", 14)
			.attr("orient", "auto")
			.append("circle")
				.attr('class', 'marker')
			    .attr("r", 7)
			    .attr('cy', 7)
			    .attr('cx', 7)

		svg.append("marker")
			.attr("id", "yellow-circle")
			.attr("refX", 7) /*must be smarter way to calculate shift*/
			.attr("refY", 7)
			.attr("markerWidth", 14)
			.attr("markerHeight", 14)
			.attr("orient", "auto")
			.append("circle")
				.attr('class', 'marker')
			    .attr("r", 7)
			    .attr('cy', 7)
			    .attr('cx', 7)

		// append lines

		this.paths.electricity.past = svg.append("path")
			.data([this.data])
			.attr("class", "past line dark electricity")
			.attr("transform", "translate(0,5)")
			.attr("d", this.lines.electricity.past);

		this.paths.water.past = svg.append("path")
			.data([this.data])
			.attr("class", "past line dark water")
			.attr("transform", "translate(0,5)")
			.attr("d", this.lines.water.past);

		

		// the "now" bar

		this.split = svg.append("rect")
			.attr("class", "split")
			.attr("x", this.scales.x(new Date()))
			.attr("height", this.height)
			.attr("width", '10px');

		this.paths.electricity.goal = svg.append("path")
			.data([this.goal_data])
			.attr("class", "goal line dark electricity")
			.attr("transform", "translate(0,5)")
			.attr("marker-end", "url(#yellow-circle)")
			.attr("d", this.lines.electricity.goal);

		this.paths.water.goal = svg.append("path")
			.data([this.goal_data])
			.attr("class", "goal line dark water")
			.attr("transform", "translate(0,5)")
			.attr("marker-end", "url(#blue-circle)")
			.attr("d", this.lines.water.goal);

		this.eAx = svg.append("g")
		    .attr("transform", "translate(" + this.scales.x(new Date()) + ",5)")
		    .attr('class', 'y axis dark electric')
		    .call(this.axes.electric);

		this.wAx = svg.append("g")
		    .attr("transform", "translate(" + this.scales.x(new Date()) - 10 + ",5)")
		    .attr('class', 'y axis dark water')
		    .call(this.axes.water);

		this.xAx = svg.append("g")
		    .attr("transform", "translate(0," + (this.height - this.margin.bottom + 20) + ")")
		    .attr('class', 'x axis dark')
		    .call(this.axes.x);

		function past_data(d) {
			if (d.stats) return true;
		}
	},

	add_datum: function(datum) {
		this.data.push(datum)
		this.now = new Date(datum.timestamp)

		var scales = this.scales,
			lines = this.lines,
			margin = this.margin,
			data = this.data;

		scales.x
			.domain([moment().subtract(20, 'd'), moment().add(40, 'd')])

		scales.electric
			.domain([d3.min(data, function(d) { return d.electric.average; }) - .5, 
					 d3.max(data, function(d) { return d.electric.average; }) + 10]);

		scales.water
			.domain([d3.min(data, function(d) { return d.water.average; }) - .5, 
					 d3.max(data, function(d) { return d.water.average; }) + 10]);

		this.update();
		// if (this.data.length > 200) this.data.shift();
	},

	update: function() {

		// this timer helps deal with the initial rush of data on a refresh
		// the on('child_added') event is fired for each existing child on page load
		// we wait till all of the data has been appended before redrawing
		// not pretty...
		clearTimeout(this.update_timer)
		this.update_timer = setTimeout(real_update, 100);

		var paths = this.paths,
			lines = this.lines,
			data = this.data,
			scales = this.scales,
			split = this.split,
			now = this.now,
			axes = this.axes,
			eAx = this.eAx,
			wAx = this.wAx,
			xAx = this.xAx;

		function real_update() {
			paths.electricity.past
				.attr('d', lines.electricity.past)
				// .attr('transform', null)
				// .transition()
				// .duration(10000)
				// .ease('linear')
				// .attr('transform', 'translate(' + scales.x(moment(scales.x.domain()[0]).subtract(10,'s')) + ')')

			paths.water.past
				.attr('d', lines.water.past)
				// .attr('transform', null)
				// .transition()
				// .duration(1000)
				// .attr('transform', 'translate(' + scales.x(moment(scales.x.domain()[0]).subtract(10,'s')) + ')')

			paths.water.goal
				.transition()
				.attr('d', lines.water.goal)

			split
				.attr("x", scales.x(now) - 5)

			eAx
				.attr("transform", "translate(" + (scales.x(now)) + ",5)")
				.call(axes.electric)

			wAx
				.attr("transform", "translate(" + (scales.x(now)) + ",5)")
				.call(axes.water)

			xAx.call(axes.x)
		}
	},

	update_goal_lines: function(goals) {
		var range = dateRange(moment().subtract(40, 'days'), moment().add(40,'days'));

		this.goal_data = range.map(function(date) {
			var index = date.dayOfYear() - 1,
				climate = climate_data[index];

			var sunrise = moment("1-01-2013 " + climate.sunrise, "M-D-YYYY Hmm Z"),
				sunset  = moment("1-01-2013 " + climate.sunset, "M-D-YYYY Hmm Z").add(1, 'day'),
				sleep   = moment("1-01-2013 11:00 pm", "M-D-YYYY h:mm a"),
				lighting_duration = moment.duration(sleep - sunset).asHours();

			var light_rate = 0.5, // kW
				hvac_rate = 0.5, // kW per delta degrees
				hvac_setting = 72, // degrees
				delta = Math.abs(hvac_setting - parseFloat(climate.temperature_max)); // degrees



			return {
				timestamp: date.format(),
				electric: light_rate * lighting_duration + delta*hvac_rate,
				water: 3 // gallons
			}
		})

		this.paths.electricity.goal
				.data([this.goal_data])
				.transition()
				.attr('d', this.lines.electricity.goal)

		this.paths.water.goal
				.data([this.goal_data])
				.transition()
				.attr('d', this.lines.water.goal)
	}
}