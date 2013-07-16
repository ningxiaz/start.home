var Clock = {
	draw: function(){
		var width = 748,
			height = 748,
			outer_radius = width/2 -80,
			inner_radius = 160;

		var today_data = [
					// {date: -1, time: 18, usage: 0.76},
					// {date: -1, time: 19, usage: 0.56},
					// {date: -1, time: 20, usage: 0.83},
					// {date: -1, time: 21, usage: 0.58},
					// {date: -1, time: 22, usage: 0.60},
					// {date: -1, time: 23, usage: 0.65},
					{date: 0, time: 0, usage: 0.34}, 
					{date: 0, time: 1, usage: 0.54}, 
					{date: 0, time: 2, usage: 0.53}, 
					{date: 0, time: 3, usage: 0.56}, 
					{date: 0, time: 4, usage: 0.97}, 
					{date: 0, time: 5, usage: 0.87}, 
					{date: 0, time: 6, usage: 0.55}, 
					{date: 0, time: 7, usage: 0.88}, 
					{date: 0, time: 8, usage: 0.71},
					{date: 0, time: 9, usage: 0.65},
					{date: 0, time: 10, usage: 0.54},
					{date: 0, time: 11, usage: 0.62},
					{date: 0, time: 12, usage: 0.76},
					{date: 0, time: 13, usage: 0.87},
					{date: 0, time: 14, usage: 0.71},
					{date: 0, time: 15, usage: 0.45},
					{date: 0, time: 16, usage: 0.66},
					{date: 0, time: 17, usage: 0.88},
					{date: 0, time: 18, usage: 0.90},
					{date: 0, time: 19, usage: 0.84}
		];

		var min = [
					// {date: -1, time: 18, usage: 0.76},
					// {date: -1, time: 19, usage: 0.56},
					// {date: -1, time: 20, usage: 0.83},
					// {date: -1, time: 21, usage: 0.58},
					// {date: -1, time: 22, usage: 0.60},
					// {date: -1, time: 23, usage: 0.65},
					{date: 0, time: 0, usage: 0.3}, 
					{date: 0, time: 1, usage: 0.5}, 
					{date: 0, time: 2, usage: 0.5}, 
					{date: 0, time: 3, usage: 0.3}, 
					{date: 0, time: 4, usage: 0.7}, 
					{date: 0, time: 5, usage: 0.73}, 
					{date: 0, time: 6, usage: 0.34}, 
					{date: 0, time: 7, usage: 0.77}, 
					{date: 0, time: 8, usage: 0.66},
					{date: 0, time: 9, usage: 0.45},
					{date: 0, time: 10, usage: 0.44},
					{date: 0, time: 11, usage: 0.45},
					{date: 0, time: 12, usage: 0.60},
					{date: 0, time: 13, usage: 0.74},
					{date: 0, time: 14, usage: 0.57},
					{date: 0, time: 15, usage: 0.44},
					{date: 0, time: 16, usage: 0.55},
					{date: 0, time: 17, usage: 0.79},
					{date: 0, time: 18, usage: 0.77},
					{date: 0, time: 19, usage: 0.67}
		];

		var max = [
					// {date: -1, time: 18, usage: 0.76},
					// {date: -1, time: 19, usage: 0.56},
					// {date: -1, time: 20, usage: 0.83},
					// {date: -1, time: 21, usage: 0.58},
					// {date: -1, time: 22, usage: 0.60},
					// {date: -1, time: 23, usage: 0.65},
					{date: 0, time: 0, usage: 0.45}, 
					{date: 0, time: 1, usage: 0.67}, 
					{date: 0, time: 2, usage: 0.66}, 
					{date: 0, time: 3, usage: 0.78}, 
					{date: 0, time: 4, usage: 1}, 
					{date: 0, time: 5, usage: 0.98}, 
					{date: 0, time: 6, usage: 0.78}, 
					{date: 0, time: 7, usage: 0.92}, 
					{date: 0, time: 8, usage: 0.83},
					{date: 0, time: 9, usage: 0.71},
					{date: 0, time: 10, usage: 0.60},
					{date: 0, time: 11, usage: 0.73},
					{date: 0, time: 12, usage: 0.80},
					{date: 0, time: 13, usage: 0.89},
					{date: 0, time: 14, usage: 0.90},
					{date: 0, time: 15, usage: 0.78},
					{date: 0, time: 16, usage: 0.74},
					{date: 0, time: 17, usage: 0.95},
					{date: 0, time: 18, usage: 0.98},
					{date: 0, time: 19, usage: 0.89}
		];

		var daytime = {
			sunrise: 6,
			sunset: 19
		}

		var angle = d3.time.scale().range([0, 2 * Math.PI]).domain([0, 24]);
		var radius = d3.scale.linear().range([inner_radius, outer_radius]).domain([0, 1]);

		var line = d3.svg.line.radial()
		    .interpolate("basis")
		    .angle(function(d) { return (angle(d.time) - Math.PI); })
		    .radius(function(d) { return radius(d.usage); });

		var area = d3.svg.area.radial()
		    .interpolate("basis")
		    .angle(function(d) { return (angle(d.time) - Math.PI); })
		    .innerRadius(inner_radius)
    		.outerRadius(function(d) { return radius(d.usage); });

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
		      .data([today_data])
		    .enter().append("path")
		      .attr("class", "area")
		      .attr("d", area);

		vis.selectAll(".line")
		      .data([today_data])
		    .enter().append("path")
		      .attr("class", "line")
		      .attr("d", line);

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