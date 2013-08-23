var Clock_Water = {
	width: 550,
	height: 550,
	radius: this.width/2 - 25,
	vis: null,
	data: null,
	
	init: function(){
		this.data = new Array();
		var temp = null;
		for(var i = 0; i < 96; i++){
			temp = {
				time: (i+1),
				elec: Math.random(),
				water: 5 + 8*Math.random()
			};

			this.data.push(temp);
		}

		vis = d3.select("#clock").append("svg")
                     .attr("width", this.width)
                     .attr("height", this.height)
                  .append("svg:g")
                     .attr("transform", "translate(" + this.width / 2 + "," + this.height / 2 + ")");

	},
	draw: function(){
		var angle = 2*Math.PI/144;

		var arc = d3.svg.arc()
        .startAngle(function(d, i){
        	return (d.time - 1)*angle;
        })
        .endAngle(function(d, i){
        	return d.time*angle;
        })
        .innerRadius(function(d, i){
        	return 150;
        })
        .outerRadius(function(d, i){
        	return (150+100*(d.elec / 1));
        });

        var water_arc = d3.svg.arc()
        .startAngle(function(d, i){
        	return (d.time - 1)*angle;
        })
        .endAngle(function(d, i){
        	return d.time*angle;
        })
        .innerRadius(function(d, i){
        	return (150 - 150*(d.water / 30));
        })
        .outerRadius(function(d, i){
        	return 150;
        });

		vis.selectAll(".arc")
			.data(this.data)
			.enter()
			.append("path")
			.attr("class", "arc")
			.attr("fill", "#ffee68")
			.attr("d", arc);


		vis.selectAll(".w_arc")
			.data(this.data)
			.enter()
			.append("path")
			.attr("class", "w_arc")
			.attr("fill", "#83d5d2")
			.attr("d", water_arc);
	}

};