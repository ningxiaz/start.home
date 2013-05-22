$(document).ready(function(){
	setTimeout(function(){
		$('.start').hide();
		$('.treemap').show();
		Treemap.draw();
	}, 3000);
});

function transition_to_clock(){
	console.log("here!");
	$('.treemap').fadeOut("fast");
	$('.clock').fadeIn("fast");
}