
// Pane container
$(function() {
	var container = $('.pane-container')

	Segue(container, {
		max: window.innerWidth,
		states: 3,
		initial_state: 1,
		reverse: true,
		elasticity: .2,
		manipulator: navPanes,
		num_touches: 1,
		stop_scroll: true
	})

	function navPanes(percent, offset, animate, element) {
		container.removeClass('animate');
		if (animate) container.addClass('animate');

		container.css('-webkit-transform', 'translate3d('+ -1*(percent+offset)*100 +'%,0,0)')
	}
})

// Past view
$(function() {
	// Make a set of all the rooms in the house
	// var rooms = config['controls']['list'].reduce(function(prev, curr) {
	// 	if (!prev[curr['room']]) prev[curr['room']] = true;

	// 	return prev;
	// }, {})

	// // just to make sure all the rooms are in there
	// rooms = config['monitors']['list'].reduce(function(prev, curr) {
	// 	if (!prev[curr['room']]) prev[curr['room']] = true;

	// 	return prev;
	// }, rooms)

	// // Make a set of all the sources in the house
	// var sources = config['controls']['list'].reduce(function(prev, curr) {
	// 	if (!prev[curr['type']]) prev[curr['type']] = true;

	// 	return prev;
	// }, {})

	// // just to make sure all the sources are in there
	// sources = config['monitors']['list'].reduce(function(prev, curr) {
	// 	if (!prev[curr['type']]) prev[curr['type']] = true;

	// 	return prev;
	// }, sources)

	// // make it an array!
	// rooms = d3.keys(rooms)
	// sources = d3.keys(sources)

	// var room_list = d3.select('#rooms-list');

	// room_list.selectAll('label')
	// 	.data(rooms).enter()
	// 	.append('label')
	// 	.attr('class', 'btn btn-blue')
	// 	// .attr('data-val', function(d) { return d; })
	// 	.text(function(d) { return d; })
	// 	.append('input')
	// 	.attr('type', 'checkbox')
	// 	.attr('name', 'room-filters[]')
	// 	.attr('value', function(d) { return d; })

	// var source_list = d3.select('#sources-list');

	// source_list.selectAll('label')
	// 	.data(sources).enter()
	// 	.append('label')
	// 	.attr('class', 'btn btn-blue')
	// 	// .attr('data-val', function(d) { return d; })
	// 	.text(function(d) { return d; })
	// 	.append('input')
	// 	.attr('type', 'checkbox')
	// 	.attr('name', 'source-filters[]')
	// 	.attr('value', function(d) { return d; })

	// $('.filter-toggle').popover({
	// 	// title: 'Filter',
	// 	placement: 'top',
	// 	html: true,
	// 	content: $('.filter-content').html(),
	// })
})

// Present view
$(function() {
})

$(function() {
	var lockContainer = $('.lockscreen')

	var controls = Segue(lockContainer, {
		max: $(window).height(),
		states: 2,
		initial_state: 0,
		reverse: true,
		orientation: 'vertical',
		elasticity: 0,
		manipulator: lockscreenSwipe,
		stop_scroll: true
	})

	$('[data-toggle="lock"]').click(function() {
		controls.next()
	})

	function lockscreenSwipe(percent, offset, animate, element) {
		// lockContainer.removeClass('animate');
		// if (animate) {
		// 	lockContainer.animate({'text-indent': -1*(percent+offset)*100}, {
		// 		step: function(now, fx) {
		// 			$(this).css('-webkit-transform', 'translate3d(0,'+now+'%,0)')
		// 		},
		// 		duration: 'fast'
		// 	}, 'easeOutBounce')
		// }

		// if (!animate) {
		// 	lockContainer.css('-webkit-transform', 'translate3d(0,'+ -1*(percent+offset)*100 +'%,0)')
		// 	lockContainer.css('text-indent', -1*(percent+offset)*100)
		// 	console.log(lockContainer.css('text-indent'))
		// }

		lockContainer.removeClass('animate');
		if (animate) lockContainer.addClass('animate');

		lockContainer.css('-webkit-transform', 'translate3d(0,'+ -1*(percent+offset)*100 +'%,0)')
	}
})

// $('*').on('click', function (e) {
//     $('.popover-link').each(function () {
//         //the 'is' for buttons that trigger popups
//         //the 'has' for icons within a button that triggers a popup
//         if (!$(this).is(e.target) && $(this).has(e.target).length === 0 && $('.popover').has(e.target).length === 0) {
//             $(this).popover('hide');
//         }
//     });
// });