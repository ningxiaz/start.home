// panes should look something like like:
// +--------------------+-------------------------+
// | "#pane1"           | "#pane2"                |
// | "#pane3"           | "#pane4"                |
// | "#pane5"           | null                    |
// +--------------------+-------------------------+
// MAKE SURE THAT EVERY SUB-ARRAY HAS THE SAME NUMBER OF ENTRIES (pad with null)

// var panes = [
// 	["#ambient-display", "#goal-setting-display"],
// 	["#below-ambient-display", "#goal-display"]
// ]

var Grid = {
	panes: null,

	page_width: window.innerWidth,
	page_height: window.innerHeight,

	num_rows: null,
	num_cols: null,

	grid_width: null,
	grid_height: null,

	current_row: 0,
	current_col: 0,

	container: null,

	init: function(_container, _panes, initial_pane) {
		// set up variables
		this.panes = _panes;
		this.container = _container;

		this.num_rows = this.panes.length;
		this.num_cols = this.panes[0].length;

		this.page_width = window.innerWidth;
		this.page_height = window.innerHeight;

		this.grid_width = this.panes[0].length * 100 + "%";
		this.grid_height = this.panes.length * 100 + "%";

		var target_row = null,
			target_col = null;

		// FIXME: #grid-container's height should not have to be set from JS... not sure why this hack has to be used
		$("#grid-container").height(this.page_height)

		// move panes into position
		for (var row = this.num_rows - 1; row >= 0; row--) {
			for (var col = this.num_cols - 1; col >= 0; col--) {
				$(this.panes[row][col]).css("-webkit-transform", "translate3d("+ col*100 +"%,"+ row*100 +"%,0)");

				// we can also use this loop to do a search for the initial pane if it's specified
				if (initial_pane && this.panes[row][col] == initial_pane) {
					target_row = row;
					target_col = col;
				}

				console.log($(this.panes[row][col]))
			};
		};

		if (initial_pane && target_row) {
			this.navToPane(target_row, target_col, false)
		} else {
			console.log("Warning: initial pane not found in array of panes")
		}

		// could hide loading spinner at this point
	},

	setContainerOffset: function(left, top, animate) {
		$('#grid-container').removeClass("animate");

	    if(animate) {
	        $('#grid-container').addClass("animate");
	    }

		$('#grid-container').css("-webkit-transform", "translate3d("+ left +"%,"+ top +"%,0)");
	},

	navToPane: function(row, col, animate) {
		// edge cases for robustness (may potentially interfere with elastic on drag)
		// alert(row + ' ' + col)

		if (row < 0) row = 0;
		if (col < 0) col = 0;
		if (row >= this.num_rows) row = this.num_rows - 1;
		if (col >= this.num_cols) col = this.num_cols - 1;

		if (this.panes[row][col] == null) return;

		if (animate == null) animate = true

		// var offset = gridToPercent(row, col); // determine where the cell is

		this.setContainerOffset(-1*col*100, -1*row*100, animate);

		// container.css("-webkit-transform", "translate3d("+ -1*col*100 +"%,"+ -1*row*100 +"%,0)");

		this.current_row = row;
		this.current_col = col;
	},

	right: function() { this.navToPane(this.current_row    , this.current_col + 1); },
	left:  function() { this.navToPane(this.current_row    , this.current_col - 1); },
	up:    function() { this.navToPane(this.current_row - 1, this.current_col    ); },
	down:  function() { this.navToPane(this.current_row + 1, this.current_col    ); }
}