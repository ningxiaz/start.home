$('.pane').on("touchmove", function(e) {
	e.preventDefault()
})

$(document).ready(function(){
	var panes = [
		[null,         "#resource-view", null        ],
		["#past-view", "#overview",      "#goal-view"]
	]

	Grid.init("#grid-container", panes, "#past-view")

	var h = $('.pane').hammer({ drag_lock_to_axis: true })

	// switch these lines to enable dragging... very buggy right now
	// h.on("swipeup swipedown swipeleft swiperight dragright dragleft dragup dragdown release", handleGesture)
	h.on("swipeup swipedown swipeleft swiperight", handleGesture)

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

	PastGoalChart.init();

	//prevent the document from scrolling
	$(document).bind('touchmove', false);
});

