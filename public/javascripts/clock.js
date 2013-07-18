var Clock = {
	draw: function(){
		var width = 748,
			height = 748,
			outer_radius = width/2 -80,
			inner_radius = 180;

		var consumption = [
					// {date: -1, time: 18, amount: 0.76},
					// {date: -1, time: 19, amount: 0.56},
					// {date: -1, time: 20, amount: 0.83},
					// {date: -1, time: 21, amount: 0.58},
					// {date: -1, time: 22, amount: 0.60},
					// {date: -1, time: 23, amount: 0.65},
					{date: 0, time: 0, amount: 0.34}, 
					{date: 0, time: 1, amount: 0.54}, 
					{date: 0, time: 2, amount: 0.53}, 
					{date: 0, time: 3, amount: 0.56}, 
					{date: 0, time: 4, amount: 0.97}, 
					{date: 0, time: 5, amount: 0.87}, 
					{date: 0, time: 6, amount: 0.55}, 
					{date: 0, time: 7, amount: 0.88}, 
					{date: 0, time: 8, amount: 0.71},
					{date: 0, time: 9, amount: 0.65},
					{date: 0, time: 10, amount: 0.54},
					{date: 0, time: 11, amount: 0.62},
					{date: 0, time: 12, amount: 0.76},
					{date: 0, time: 13, amount: 0.87},
					{date: 0, time: 14, amount: 0.71},
					{date: 0, time: 15, amount: 0.45},
					{date: 0, time: 16, amount: 0.66},
					{date: 0, time: 17, amount: 0.88},
					{date: 0, time: 18, amount: 0.90},
					{date: 0, time: 19, amount: 0.84}
		];

		var min = [
					// {date: -1, time: 18, amount: 0.76},
					// {date: -1, time: 19, amount: 0.56},
					// {date: -1, time: 20, amount: 0.83},
					// {date: -1, time: 21, amount: 0.58},
					// {date: -1, time: 22, amount: 0.60},
					// {date: -1, time: 23, amount: 0.65},
					{date: 0, time: 0, amount: 0.3}, 
					{date: 0, time: 1, amount: 0.5}, 
					{date: 0, time: 2, amount: 0.5}, 
					{date: 0, time: 3, amount: 0.3}, 
					{date: 0, time: 4, amount: 0.7}, 
					{date: 0, time: 5, amount: 0.73}, 
					{date: 0, time: 6, amount: 0.34}, 
					{date: 0, time: 7, amount: 0.77}, 
					{date: 0, time: 8, amount: 0.66},
					{date: 0, time: 9, amount: 0.45},
					{date: 0, time: 10, amount: 0.44},
					{date: 0, time: 11, amount: 0.45},
					{date: 0, time: 12, amount: 0.60},
					{date: 0, time: 13, amount: 0.74},
					{date: 0, time: 14, amount: 0.57},
					{date: 0, time: 15, amount: 0.44},
					{date: 0, time: 16, amount: 0.55},
					{date: 0, time: 17, amount: 0.79},
					{date: 0, time: 18, amount: 0.77},
					{date: 0, time: 19, amount: 0.67}
		];

		var max = [
					// {date: -1, time: 18, amount: 0.76},
					// {date: -1, time: 19, amount: 0.56},
					// {date: -1, time: 20, amount: 0.83},
					// {date: -1, time: 21, amount: 0.58},
					// {date: -1, time: 22, amount: 0.60},
					// {date: -1, time: 23, amount: 0.65},
					{date: 0, time: 0, amount: 0.45}, 
					{date: 0, time: 1, amount: 0.67}, 
					{date: 0, time: 2, amount: 0.66}, 
					{date: 0, time: 3, amount: 0.78}, 
					{date: 0, time: 4, amount: 1}, 
					{date: 0, time: 5, amount: 0.98}, 
					{date: 0, time: 6, amount: 0.78}, 
					{date: 0, time: 7, amount: 0.92}, 
					{date: 0, time: 8, amount: 0.83},
					{date: 0, time: 9, amount: 0.71},
					{date: 0, time: 10, amount: 0.60},
					{date: 0, time: 11, amount: 0.73},
					{date: 0, time: 12, amount: 0.80},
					{date: 0, time: 13, amount: 0.89},
					{date: 0, time: 14, amount: 0.90},
					{date: 0, time: 15, amount: 0.78},
					{date: 0, time: 16, amount: 0.74},
					{date: 0, time: 17, amount: 0.95},
					{date: 0, time: 18, amount: 0.98},
					{date: 0, time: 19, amount: 0.89}
		];

		var production = [
					// {date: -1, time: 18, amount: 0.76},
					// {date: -1, time: 19, amount: 0.56},
					// {date: -1, time: 20, amount: 0.83},
					// {date: -1, time: 21, amount: 0.58},
					// {date: -1, time: 22, amount: 0.60},
					// {date: -1, time: 23, amount: 0.65},
					{date: 0, time: 0, amount: 0}, 
					{date: 0, time: 1, amount: 0}, 
					{date: 0, time: 2, amount: 0}, 
					{date: 0, time: 3, amount: 0}, 
					{date: 0, time: 4, amount: 0}, 
					{date: 0, time: 5, amount: 0}, 
					{date: 0, time: 6, amount: 0.12}, 
					{date: 0, time: 7, amount: 0.23}, 
					{date: 0, time: 8, amount: 0.30},
					{date: 0, time: 9, amount: 0.42},
					{date: 0, time: 10, amount: 0.52},
					{date: 0, time: 11, amount: 0.49},
					{date: 0, time: 12, amount: 0.56},
					{date: 0, time: 13, amount: 0.51},
					{date: 0, time: 14, amount: 0.46},
					{date: 0, time: 15, amount: 0.38},
					{date: 0, time: 16, amount: 0.29},
					{date: 0, time: 17, amount: 0.23},
					{date: 0, time: 18, amount: 0.18},
					{date: 0, time: 19, amount: 0.07}
		];

		var daytime = {
			sunrise: 6,
			sunset: 19
		}

		var angle = d3.time.scale().range([0, 2 * Math.PI]).domain([0, 24]);
		var radius = d3.scale.linear().range([inner_radius, outer_radius]).domain([0, 1]);
		var p_radius = d3.scale.linear().range([inner_radius, inner_radius - 60]).domain([0, 1]);

		var line = d3.svg.line.radial()
		    .interpolate("basis")
		    .angle(function(d) { return (angle(d.time) - Math.PI); })
		    .radius(function(d) { return radius(d.amount); });

		var p_line = d3.svg.line.radial()
		    .interpolate("basis")
		    .angle(function(d) { return (angle(d.time) - Math.PI); })
		    .radius(function(d) { return p_radius(d.amount); });

		var area = d3.svg.area.radial()
		    .interpolate("basis")
		    .angle(function(d) { return (angle(d.time) - Math.PI); })
		    .innerRadius(inner_radius)
    		.outerRadius(function(d) { return radius(d.amount); });

		var p_area = d3.svg.area.radial()
		    .interpolate("basis")
		    .angle(function(d) { return (angle(d.time) - Math.PI); })
		    .innerRadius(function(d) { return p_radius(d.amount); })
    		.outerRadius(inner_radius);

    	var arc = d3.svg.arc()
	        .startAngle(function(d, i){
	        	return (angle(d.sunrise) - Math.PI);
	        })
	        .endAngle(function(d, i){
	        	return (angle(d.sunset) - Math.PI);
	        })
	        .innerRadius(outer_radius)
	        .outerRadius(outer_radius + 25);

    	var vis = d3.select("#clock").append("svg")
                     .attr("width", width)
                     .attr("height", height)
                  .append("svg:g")
                     .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

        vis.selectAll(".area")
		      .data([consumption])
		    .enter().append("path")
		      .attr("class", "area")
		      .attr("d", area);

		vis.selectAll(".line")
		      .data([consumption])
		    .enter().append("path")
		      .attr("class", "line")
		      .attr("d", line);

		vis.selectAll(".p_area")
		      .data([production])
		    .enter().append("path")
		      .attr("class", "p_area")
		      .attr("d", p_area);

		vis.selectAll(".p_line")
		      .data([production])
		    .enter().append("path")
		      .attr("class", "p_line")
		      .attr("d", p_line);

		vis.selectAll(".min_line")
			  .data([min])
		    .enter().append("path")
		      .attr("class", "min_line")
		      .attr("d", line);

		vis.selectAll(".max_line")
			  .data([max])
		    .enter().append("path")
		      .attr("class", "max_line")
		      .attr("d", line);

		vis.selectAll(".daytime_arc")
			  .data([daytime])
		    .enter().append("path")
		      .attr("class", "daytime_arc")
		      .attr("d", arc);

	}
};