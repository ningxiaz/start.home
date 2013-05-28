var Ambient = {
	circles: [],
	vis: null,
	rScale: null,
	width: 1024,
	height: 748,
	padding: 80,
	init: function(){
		//two big circles in the background
		this.circles.push(new Circle(0, 0, 800, "none", "#84c7c7", 5));
		this.circles.push(new Circle(10, 10, 600, "none", "#91cd5b", 5));

		//categorical circles
		//hvac
		this.circles.push(new Circle(-0.3*this.width, 180, 300, "#ee854b", "none", 5));
		//lights
		this.circles.push(new Circle(0.28*this.width, 100, 250, "#fae200", "none", 5));
		//outlets
		this.circles.push(new Circle(0.25*this.width, -200, 150, "#7368e5", "none", 5));
		//appliances
		this.circles.push(new Circle(-0.2*this.width, -300, 120, "#e3797e", "none", 5));
		//Misc
		this.circles.push(new Circle(-0.4*this.width, -200, 80, "#e39ab3", "none", 5));

		//appliance circles of hvac
		this.circles.push(new Circle(-0.3*this.width + 80, 180 - 80 , 50, "none", "#ee854b", 5));
		this.circles.push(new Circle(-0.3*this.width - 80, 180 + 80 , 120, "none", "#ee854b", 5));

		//appliance circles of lights
		this.circles.push(new Circle(0.28*this.width + 60, 250 - 80 , 30, "none", "#fae200", 5, "bedroom_lights"));
		this.circles.push(new Circle(0.28*this.width - 40, 250 - 240 , 80, "none", "#fae200", 5, "living_lights"));
		this.circles.push(new Circle(0.28*this.width + 20, 250 - 60 , 60, "none", "#fae200", 5, "kitchen_lights"));


		this.rScale = d3.scale.linear()
						.domain([0, 800])
						.range([0, this.height/2 - this.padding]);

		this.vis = d3.select(".ambient").append("svg")
                 .attr("width", this.width)
                 .attr("height", this.height)
              .append("svg:g")
                 .attr("transform", "translate(" + this.width / 2 + "," + this.height / 2 + ")");
                 //coordinates start from the center		
	},
	draw: function(){
        // the D3 method of drawing all the circles
        var vis_circles = this.vis.selectAll("circle")
        				.data(this.circles)
        				.enter()
        				.append("circle")
        				.attr("cy", function(d){ return d.cy })
        				.attr("cx", function(d){ return d.cx })
        				.attr("r", function(d){ return Ambient.rScale(d.r); })
        				.attr("stroke", function(d){ 
        					return d.stroke;
        				})
        				.attr("stroke-width", function(d){ return d.stroke_width})
        				.attr("fill", function(d){ return d.fill})
        				.attr("class", function(d){
        					if(d.selector != undefined) return (d.selector+' vis_circles');
        					return 'vis_circles';
        				});


	}
};

// the Circle object, that defines its look on the screen
function Circle(cx, cy, r, stroke, fill, stroke_width, selector){
	this.cx = cx;
	this.cy = cy;
	this.r = r; // actually the data it represents
	this.stroke = stroke;
	this.fill = fill;
	this.stroke_width = stroke_width;
	this.saturation = 1;
	this.selector = selector;
};

var DataManager = {
	//bind event listeners
	init: function(){
		$('.kitchen_lights').bind('kitchen_lights_more', function(event, amount){
			console.log("here, event! "+amount);
			Ambient.vis.selectAll('.kitchen_lights')
						.transition()
						.attr("r", function(d){ 
							var new_val = parseInt(d.r) + parseInt(amount);
							d.r = new_val;
							return Ambient.rScale(new_val); 
						});
		});
	},

	process_data: function(time){
		// $.getJSON("sample.json", function(data) {
					    
		// });
		$('.kitchen_lights').trigger("kitchen_lights_more", ['20']);
	},

};



