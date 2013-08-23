
// Pane container
$(function() {
	var container = $('.pane-container')

	Segue(container, {
		max: window.innerWidth,
		states: 3,
		initial_state: 2,
		reverse: true,
		elasticity: .2,
		manipulator: navPanes
	})

	function navPanes(percent, offset, animate, element) {
		container.removeClass('animate');
		if (animate) container.addClass('animate');

		container.css('-webkit-transform', 'translate3d('+ -1*(percent+offset)*100 +'%,0,0)')
	}
})

// Past view
$(function() {
	$('.filter-toggle').popover({
		title: 'Filter by room',
		placement: 'top',
		html: true,
		content: $('.filter-content').html(),
	})
})