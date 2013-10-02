
// Austin's thoughts on the past view:

// The past view is probably the most complicated panel because it has to
// handle a lot of data gracefully. Visualizations on the past view can go
// "stale" in the sense that they will only be updated once when they're drawn
// to the screen. This is important in minimizing costly Firebase API calls.

// The timeline provides brushing so we can let the users select a specific
// time period to focus on. We can use Firebase startAt and endAt queries to
// load the relevant data and we can then process it for the visualization.
// Updating the timeline will cause the active visualization to refresh.
// Though it would be nice to cache past data on the iPad, this is not a must-
// have feature yet (unless performance really takes a hit otherwise).

// I propose that we provide a simple "refresh" button once the visualization
// is considered "stale". I also think it is important that we make it obvious
// that the past view does not update in real time (by showing a little
// "Generated at 3 pm" sort of caption)

// Another UX issue is the timeline itself. Brushing is meant to happen in
// real time (brush domain updates -> focus domain updates), but we're loading
// data straight from Firebase. This means we want to wait until the user is
// done brushing in order to update the focus vis. I think a simple "Release
// to update" caption would be nice and unobtrusive.

$(function() {
	var view = pastView();

	// view.init();

	// $('.pane-container').on('segue', function(e, state) {
	// 	if (state == 1) view.activate();
	// 	else view.deactivate();
	// })
})

function pastView() {

	var fb,          // base Firebase ref
		vis,         // map of visualizations
		active_vis,  // active visualization
		start,       // start date for data query
		end,         // end date for data query
		data_type,   // 'electric' or 'water'
		data_metric, // 'average' or 'total'
		room_filters,
		source_filters;

	function init() {
		console.log("Initializing past view")
		NProgress.start()

		fb = new Firebase(config['firebase_url']);

		vis = {
			'timeline': timeline(updateFocus),
			'tiles': tiles(),
			'gantt': gantt(),
		};

		$(vis['gantt'].selector).hide()

		active_vis  = 'tiles';
		data_type   = 'electric';
		data_metric = 'total';
		room_filters = [];
		source_filters = [];

		// keep the timeline up-to-date
		// TODO: consider switching this to just use snapshots/all...
		fb.child('snapshots/hourly').on('value', function(snapshot) {
			snapshot = snapshot.val();

			var data = d3.values(snapshot)
			vis['timeline'].update(data);
		})

        // "gently" load all of the data

        // Firebase keeps all data with an `on` handler attached to it in
        // memory, so this loads it all and cuts down on costly requests when
        // updating the visualization. Comment/uncomment these lines to adjust
        // performance when loading:
		// fb.child('snapshots/all').on('value', noop)
		// function noop() {}

		$('[name="active-vis"]').on('change', function() {
			var new_vis = $(this).val();
			if (active_vis == new_vis) return;

			$(vis[active_vis].selector).hide()

			active_vis = new_vis;

			$(vis[active_vis].selector).show()
			updateVisData();
		})

		$('[name="active-data-type"]').on('change', function() {
			var new_type = $(this).val();
			if (data_type == new_type) return;

			data_type = new_type;
			updateVisAccesors();
		})

		// $('[name="room-filters[]"]').on('change', function() {
		// 	var f = [];
		// 	$('#rooms-list input[type=checkbox]:checked').each(function(e) {
		// 		f.push($(this).val())
		// 	})

		// 	room_filters = f;

		// 	updateVisAccesors()
		// })

		// $('[name="source-filters[]"]').on('change', function() {
		// 	var f = []
		// 	$('#rooms-list input[type=checkbox]:checked').each(function(e) {
		// 		f.push($(this).val())
		// 	})

		// 	source_filters = f;

		// 	updateVisAccesors()
		// })
	}

	// timeline brushing callback
	function updateFocus(extent) {
		start = moment(extent[0]);
		end = moment(extent[1]);

		updateVisData()
	}

	// updates the active vis
	function updateVisData() {
		fb.child('snapshots/all').startAt(+start).endAt(+end).once('value', function(snapshot) {
			snapshot = snapshot.val();

			NProgress.inc()

			vis[active_vis].set(data_type, data_metric, false)
			vis[active_vis].update(snapshot)

			NProgress.done()
		})
	}

	function updateVisAccesors() {
		vis[active_vis].set(data_type, data_metric, true)
	}

	// expose the API
	return {
		init: init,
	}
}






