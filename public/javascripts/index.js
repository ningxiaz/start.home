$(document).ready(function(){
	Clock.draw();

	//prevent the document from scrolling
	$(document).bind('touchmove', false);

	$('#past').click(function(){
		Clock.to_linear();
	});
});