var FloorPlan = {
	width: 400, //actual size of the SVG area
	height: 400,
	vis: null,
	padding: 50, //leave room for circles

	init: function(){
		vis = d3.select("#floorplan").append("svg")
                     .attr("width", this.width + 2*this.padding)
                     .attr("height", this.height + 2*this.padding)
                  .append("svg:g")
                  	 .attr("transform", "translate(" + this.padding + "," + this.padding+ ")");
	},

	draw_rects: function(){
		d3.json("data/floorplan.json", function(json){
			//enable scaling, read in the coordinate range from JSON file
			var x_scale = d3.scale.linear().range([0, json.width]).domain([0, FloorPlan.width]);
			var y_scale = d3.scale.linear().range([0, json.height]).domain([0, FloorPlan.height]);

			for(var i = 0; i < json.rooms.length; i++){
				vis.append("rect")
					.attr("class", "floorplan_rect")
					.attr("x", x_scale(json.rooms[i].x))
					.attr("y", y_scale(json.rooms[i].y))
					.attr("height", y_scale(json.rooms[i].height))
					.attr("width", x_scale(json.rooms[i].width));
			}

			
		});
	},




};