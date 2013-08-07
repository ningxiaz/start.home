var FloorPlan = {
	width: 400, //will it be able to scale?
	height: 400,
	vis: null,

	init: function(){
		vis = d3.select("#floorplan").append("svg")
                     .attr("width", this.width)
                     .attr("height", this.height)
                  .append("svg:g");
	},

	draw_rects: function(){
		d3.json("data/floorplan.json", function(json){
			console.log(json);

			for(var i = 0; i < json.rooms.length; i++){
				vis.append("rect")
					.attr("class", "floorplan_rect")
					.attr("x", json.rooms[i].x)
					.attr("y", json.rooms[i].y)
					.attr("height", json.rooms[i].height)
					.attr("width", json.rooms[i].width);
			}

			
		});
	},

	


};