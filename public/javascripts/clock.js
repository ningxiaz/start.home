var Clock = {
	draw: function(){
		var width = 550,
			height = 550,
			outer_radius = width/2 -25,
			inner_radius = 130;

		var data = [{time: 0, usage: 0.34}, {time: 1, usage: 0.54}, {time: 2, usage: 0.53}, {time: 3, usage: 0.56}, {time: 4, usage: 0.97}, {time: 5, usage: 0.87}, {time: 6, usage: 0.55}, {time: 7, usage: 0.88}, {time: 8, usage: 0.71}, {time: 9, usage: 0.79}, {time: 10, usage: 0.67}, {time: 11, usage: 0.56}];
		//var data = [0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5];


		var angle = d3.time.scale().range([0, 2 * Math.PI]).domain([0, 12]);
		var radius = d3.scale.linear().range([inner_radius, outer_radius]).domain([0, 1]);

		var line = d3.svg.line.radial()
		    .interpolate("cardinal")
		    .angle(function(d) { return angle(d.time); })
		    .radius(function(d) { return radius(d.usage); });

		var area = d3.svg.area.radial()
		    .interpolate("cardinal")
		    .angle(function(d) { return angle(d.time); })
		    .innerRadius(inner_radius)
    		.outerRadius(function(d) { return radius(d.usage); });

    	var vis = d3.select("#clock").append("svg")
                     .attr("width", width)
                     .attr("height", height)
                  .append("svg:g")
                     .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

        vis.selectAll(".area")
		      .data([data])
		    .enter().append("path")
		      .attr("class", "area")
		      .attr("d", area);

		vis.selectAll(".line")
		      .data([data])
		    .enter().append("path")
		      .attr("class", "line")
		      .attr("d", line);

	}
};