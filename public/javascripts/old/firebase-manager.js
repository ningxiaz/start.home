$(function() {
	// Root reference
	var rootRef = new Firebase('https://start-home.firebaseio.com/');

	// Misc references
	var snapRef = rootRef.child('snapshots/all');
	var goalRef = rootRef.child('goals');
	var fixRef  = rootRef.child('fixtures');


	// snapRef.limit(200).on('value', function(snapshot) {
	// 	timeline.set_data(snapshot.val())
	// 	past_view.set_data(snapshot.val())
	// })

	// Every time the server pushes a new snapshot
	snapRef.on('child_added', addSnapshot)

	function addSnapshot(snapshot) {
		// timeline.add_datum(snapshot.val())
		goal_view.add_datum(snapshot.val())
	}

	// // Every time goals are updated
	goalRef.on('value', function(snapshot) {
		timeline.set_goal(snapshot.val().electric)
		// goal_view.set_goals(snapshot.val())
	})

	// fixRef.on('value', function(snapshot) {
	// 	floorplan.set_data(snapshot.val())
	// })
})