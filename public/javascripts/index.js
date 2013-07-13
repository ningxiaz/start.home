$(document).ready(function() {
	var container = document.getElementById('grid-container');
	var past = document.getElementById('past-timeline')

	// general panning
	Segue(container, {
		max: window.innerWidth,
		states: 3,
		initial_state: 1,
		reverse: true,
		elasticity: .4,
		manipulator: navWindow
	})

	// really rough scrolling through past... probably not ideal
	Segue(past, {
		max: 400,
		complete: false,
		reverse: true,
		manipulator: navPast
	})

	// percent = how far into the transition we are
	// offset = which step we're on
	// animate = whether or not the transition should be animated
	// element = the element Segue is watching for gestures
	function navWindow(percent, offset, animate, element) {
		$('#grid-container').removeClass('animate');
		if (animate) $('#grid-container').addClass('animate');

		$('#timeline').removeClass('animate');
		if (animate) $('#timeline').addClass('animate');

		$('#grid-container').css('-webkit-transform', 'translate3d('+ -1*(percent+offset)*100 +'%,0,0)')

		$('#timeline').css('-webkit-transform', 'translate3d('+ -.25*(percent+offset)*100 +'%,0,0)')
	}

	function navPast(percent, offset, animate, element) {
		$('#past-timeline').removeClass('animate');
		if (animate) $('#past-timeline').addClass('animate');

		$('#past-timeline').css('-webkit-transform', 'translate3d('+-1*(percent+offset)*100 +'%,0,0)')
	}

	past_timeline.init();
	past_timeline.draw();

	future_timeline.init();
	future_timeline.draw();
})