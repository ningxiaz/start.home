$(document).ready(function(){
	setTimeout(function(){
		$('.start').hide();
		$('.ambient').show();
		Ambient.init();
		Ambient.draw();
		DataManager.init();
	}, 500);
});