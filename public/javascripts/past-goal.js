var PastGoalChart = {

	init: function(){
		var width = 1024,
			height = 768;

		var data = [{time: 1, usage: 1.3},
					{time: 2, usage: 1.45},
					{time: 3, usage: 1.26},
					{time: 4, usage: 1.37},
					{time: 5, usage: 1.47},
					{time: 6, usage: 1.25},
					{time: 7, usage: 1.48},
					{time: 8, usage: 1.21},
					{time: 9, usage: 1.59},
					{time: 10, usage: 0.87},
					{time: 11, usage: 0.45},
					{time: 12, usage: 0.26},
					{time: 13, usage: 0.37},
					{time: 14, usage: 0.47},
					{time: 15, usage: 0.25},
					{time: 16, usage: 0.48},
					{time: 17, usage: 0.21},
					{time: 18, usage: 0.1},
					{time: 19, usage: 1.4},
					{time: 20, usage: 1.45},
					{time: 21, usage: 1.26},
					{time: 22, usage: 1.37},
					{time: 23, usage: 1.47},
					{time: 24, usage: 1.25},
					{time: 25, usage: 1.48},
					{time: 26, usage: 1.21},
					{time: 27, usage: 1.59},
					{time: 28, usage: 0.87},
					{time: 29, usage: 0.45},
					{time: 30, usage: 0.26},
					{time: 31, usage: 0.37},
					{time: 32, usage: 0.47},
					{time: 33, usage: 0.25},
					{time: 34, usage: 0.48},
					{time: 35, usage: 0.21},
					{time: 36, usage: 0.1}];

	  	var parseDate = d3.time.format("%d-%b-%y").parse;

		var x = d3.time.scale().range([0, width]),
			x2 = d3.time.scale().range([0, width]),
			y = d3.scale.linear().range([height-300, 0]),
			y2 = d3.scale.linear().range([60, 0]);

		var brush = d3.svg.brush()
		    .x(x2)
		    .on("brush", brushed);

		var line = d3.svg.line()
			.x(function(d) { return x(d.time); })
			.y(function(d) { return y(d.usage); })
			.interpolate("basis");

		var line2 = d3.svg.line()
			.x(function(d) { return x2(d.time); })
			.y(function(d) { return y2(d.usage); })
			.interpolate("basis");

		var focus = d3.select("#past-goal-view .focus").append("svg")
			.attr("width", width)
			.attr("height", height - 60)
			.append("g")

		var context = d3.select("#past-goal-view .context").append("svg")
			.attr("width", width)
			.attr("height", 60)
			.append("g");

		x.domain(d3.extent(data, function(d) { return d.time; }));
  		y.domain(d3.extent(data, function(d) { return d.usage; }));
  		x2.domain(x.domain());
  		y2.domain(y.domain());

		focus.append("path")
			.datum(data)
			.attr("class", "line")
			.attr("d", line);

		context.append("path")
			.datum(data)
			.attr("class", "data-focus")
			.attr("class", "line")
			.attr("d", line2);

		context
				.attr("class", "x brush data-context")
				.call(brush)
			.selectAll("rect")
				.attr("height", 60);

		function brushed() {
			x.domain(brush.empty() ? x2.domain() : brush.extent());
			focus.select("path").attr("d", line);
		}
	}

};