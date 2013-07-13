$(document).ready(function(){
	Clock_Water.init();
	Clock_Water.draw();

	//prevent the document from scrolling
	$(document).bind('touchmove', false);
});