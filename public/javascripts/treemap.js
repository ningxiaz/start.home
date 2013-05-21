var Treemap = {
	margin: {},
	width: 0,
	height: 0,

	draw: function(){
		this.margin = {top: 5, right: 5, bottom: 5, left: 5};
		this.width = 1024 - this.margin.left - this.margin.right;
		this.height = 748 - this.margin.top - this.margin.bottom;

		var color = d3.scale.category10();

		var treemap = d3.layout.treemap()
		    .size([this.width, this.height])
		    .sticky(true)
		    .value(function(d) { return d.size; });

		var div = d3.select(".treemap").append("div")
		    .style("position", "relative")
		    .style("width", (this.width + this.margin.left + this.margin.right) + "px")
		    .style("height", (this.height + this.margin.top + this.margin.bottom) + "px")
		    .style("left", this.margin.left + "px")
		    .style("top", this.margin.top + "px");

		d3.json("/data/home.json", function(error, root) {
		  var node = div.datum(root).selectAll(".node")
		      .data(treemap.value(function(d){return d.size}).nodes)
		    .enter().append("div")
		      .attr("class", "node")
		      .call(position)
		      .style("background", function(d) { return d.children ? color(d.name) : null; })
		      .text(function(d) { return d.children ? null : d.name; });
		});

		function position() {
		  this.style("left", function(d) { return d.x + "px"; })
		      .style("top", function(d) { return d.y + "px"; })
		      .style("width", function(d) { return Math.max(0, d.dx - 1) + "px"; })
		      .style("height", function(d) { return Math.max(0, d.dy - 1) + "px"; });
		}
	}
};



