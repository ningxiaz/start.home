$(document).ready(function(){
	$('.ambient').click(function(event){
		$('.ambient').fadeOut();
		$('.main').fadeIn();
		event.stopPropagation();
		Clock.init();
		Clock.draw();
	});

	setTimeout(function(){
		$('.start').fadeOut();
		$('.ambient').fadeIn();
		Ambient.init();
		Ambient.draw();
		//DataManager.init();
	}, 500);

	//prevent the document from scrolling
	$(document).bind('touchmove', false);
});