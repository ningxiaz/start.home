$(document).ready(function(){
	Clock.draw();

	//prevent the document from scrolling
	$(document).bind('touchmove', false);

	$('#past').click(function(){
		Clock.to_linear(show_floorplan);

	});
});

function show_floorplan(){
	$('#floorplan').append("<svg id=\"floorplan_svg\" height=\"400\" width=\"400\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" ><image x=\"0\" y=\"0\" height=\"400\" width=\"400\"  xlink:href=\"images/floorplan.svg\" /></svg>");
}