$(function() {
	// Root reference
	var rootRef = new Firebase('https://start-home.firebaseio.com/');

	// Misc references
	var snapRef = rootRef.child('usage/snapshots');
	var goalRef = rootRef.child('goals');


	// Every time the server pushes a new snapshot
	snapRef.limit(200).on('child_added', function(snapshot) {
		timeline.add_datum(snapshot.val())
		goal_view.add_datum(snapshot.val())
	})

	// Every time goals are updated
	goalRef.on('value', function(snapshot) {
		timeline.set_goal(snapshot.val().electric)
		goal_view.set_goals(snapshot.val())
	})
})