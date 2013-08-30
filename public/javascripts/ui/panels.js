
// Pane container
$(function() {
	var container = $('.pane-container')

	Segue(container, {
		max: window.innerWidth,
		states: 3,
		initial_state: 0,
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
		// title: 'Filter',
		placement: 'top',
		html: true,
		content: $('.filter-content').html(),
	})
})

$('*').on('click', function (e) {
    $('.popover-link').each(function () {
        //the 'is' for buttons that trigger popups
        //the 'has' for icons within a button that triggers a popup
        if (!$(this).is(e.target) && $(this).has(e.target).length === 0 && $('.popover').has(e.target).length === 0) {
            $(this).popover('hide');
        }
    });
});