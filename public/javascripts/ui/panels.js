$(function() {
	var container = $('.pane-container')

	Segue(container, {
		max: window.innerWidth,
		states: 3,
		initial_state: 1,
		reverse: true,
		elasticity: .2,
		manipulator: navPanes
	})

	// Segue(container, {
	// 	max: window.innerWidth,
	// 	states: 3,
	// 	initial_state: 2,
	// 	reverse: true,
	// 	elasticity: .2,
	// 	manipulator: navTimeline
	// })

	// percent = how far into the transition we are
	// offset = which step we're on
	// animate = whether or not the transition should be animated
	// element = the element Segue is watching for gestures
	function navPanes(percent, offset, animate, element) {
		container.removeClass('animate');
		if (animate) container.addClass('animate');

		container.css('-webkit-transform', 'translate3d('+ -1*(percent+offset)*100 +'%,0,0)')
	}
})