var Clock = {
	width: window.innerWidth,
	height: window.innerHeight,
	radius: this.width/2 - 25,
	vis: null,
	data: [{time: 1, usage: 0.87}, {time: 2, usage: 0.45}, {time: 3, usage: 0.26}, {time: 4, usage: 0.37}, {time: 5, usage: 0.47}, {time: 6, usage: 0.25}, {time: 7, usage: 0.48}, {time: 8, usage: 0.21}, {time: 9, usage: 0.59}],
	
	init: function(){
		this.vis = d3.select("#clock").append("svg")
                     .attr("width", this.width)
                     .attr("height", this.height)
                  .append("svg:g")
                     .attr("transform", "translate(" + this.width/2 + "," + this.height/2 + ")");

	},
	draw: function(){
		var angle = 2*Math.PI/12;

		var arc = d3.svg.arc()
        .startAngle(function(d, i){
        	return (d.time - 1)*angle;
        })
        .endAngle(function(d, i){
        	return d.time*angle;
        })
        .innerRadius(function(d, i){
        	return 0;
        })
        .outerRadius(function(d, i){
        	return 500*(d.usage / 1);
        });

		this.vis.selectAll(".arc")
			.data(this.data)
			.enter()
			.append("path")
			.attr("class", "arc")
			.attr("fill", "#ffee68")
			.attr("d", arc);
	}

};