$(document).ready(function() {
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
	}

	data_manager.on('init', function(d) {
		timeline.init(d);
		timeline.draw();
	})

	data_manager.on("update", function(d) {
		timeline.update(d);
	})

	$('body').on('touchstart', function(e) {
		$('#grid-container').addClass('touched')
	})

	$('body').on('touchend', function(e) {
		$('#grid-container').removeClass('touched')
	})
})

$(document).on('statechange', function(e, state) {
	$('.past-visible, .present-visible, .future-visible').removeClass('visible')

	if (state == 0) $('.past-visible').addClass('visible');
	if (state == 1) $('.present-visible').addClass('visible');
	if (state == 2) $('.future-visible').addClass('visible');
})

var socket = io.connect('http://10.0.1.45');
socket.on('init',   function (data) { data_manager.init(data); });
socket.on('update', function (data) { data_manager.update(data); });

