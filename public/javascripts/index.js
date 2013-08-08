$(document).ready(function(){
	var container = document.getElementById('grid-container');

	// general panning
	Segue(container, {
		max: window.innerWidth,
		states: 3,
		initial_state: 1,
		reverse: true,
		elasticity: .2,
		manipulator: navPanes
	})

	Segue(container, {
		max: window.innerWidth,
		states: 3,
		initial_state: 1,
		reverse: true,
		elasticity: .2,
		manipulator: navTimeline
	})

	// percent = how far into the transition we are
	// offset = which step we're on
	// animate = whether or not the transition should be animated
	// element = the element Segue is watching for gestures
	function navPanes(percent, offset, animate, element) {
		$('#grid-container').removeClass('animate');
		if (animate) $('#grid-container').addClass('animate');

		$('#grid-container').css('-webkit-transform', 'translate3d('+ -1*(percent+offset)*100 +'%,0,0)')
	}

	function navTimeline(percent, offset, animate, element) {
		$('#timeline figure').removeClass('animate');
		if (animate) $('#timeline figure').addClass('animate');

		
		$('#timeline figure').css('-webkit-transform', 'translate3d('+ -0.16666667*(percent+offset)*100 +'%,0,0)')

		$('#timeline ').removeClass('animate');
		if (animate) $('#timeline').addClass('animate');

		var saturated_y = percent + offset;

		if (saturated_y < 1) saturated_y = 1;
		if (saturated_y > 2) saturated_y = 2;

		saturated_y -= 1;

		saturated_y *= -100;

		$('#timeline').css('-webkit-transform', 'translate3d(0,' + saturated_y + '%,0)')
	}

	timeline.init();
	timeline.draw();

	goal_view.init();
	goal_view.draw();


	Clock.draw();

	$('#past').click(function(){
		Clock.to_linear(show_now);
	});
});

function show_now(){
	$('#timeline').fadeIn();
	FloorPlan.init();
	FloorPlan.draw_rects();
	$('#floorplan').append("<svg id=\"floorplan_svg\" height=\"400\" width=\"400\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" ><image x=\"0\" y=\"0\" height=\"400\" width=\"400\"  xlink:href=\"images/floorplan.svg\" /></svg>");
}
