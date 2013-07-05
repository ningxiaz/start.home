// FIXME: This probably isn't the best way to organize the touch handling
function handleGesture(ev) {
	ev.gesture.preventDefault();
	switch(ev.type) {
		// drags
		case 'dragright':
		case 'dragleft':
			// stick to the finger
            var pane_offset = -(100)*Grid.current_col;
            var drag_offset = ((100/Grid.page_width)*ev.gesture.deltaX) / Grid.num_cols;

            // slow down at the first and last pane
            // if((current_pane == 0 && ev.gesture.direction == Hammer.DIRECTION_RIGHT) ||
            //     (current_pane == pane_count-1 && ev.gesture.direction == Hammer.DIRECTION_LEFT)) {
            //     drag_offset *= .4;
            // }

            Grid.setContainerOffset(drag_offset + pane_offset, 0);
            break;

        case 'dragup':
		case 'dragdown':
			// stick to the finger
            var pane_offset = -(100)*Grid.current_row;
            var drag_offset = ((100/Grid.page_height)*ev.gesture.deltaY) / Grid.num_rows;

            // slow down at the first and last pane
            // if((current_pane == 0 && ev.gesture.direction == Hammer.DIRECTION_RIGHT) ||
            //     (current_pane == pane_count-1 && ev.gesture.direction == Hammer.DIRECTION_LEFT)) {
            //     drag_offset *= .4;
            // }

            Grid.setContainerOffset(0, drag_offset + pane_offset);
            break;


		// swipes
		case 'swipeleft':
			Grid.right()
			ev.gesture.stopDetect()
			break;

		case 'swiperight':
			Grid.left()
			ev.gesture.stopDetect()
			break;

		case 'swipeup':
			Grid.down()
			ev.gesture.stopDetect()
			break;

		case 'swipedown':
			Grid.up()
			ev.gesture.stopDetect()
			break;

		// release
		case 'release':
       	 	// more then 50% moved, navigate
            if(Math.abs(ev.gesture.deltaX) > Grid.page_width/2 || Math.abs(ev.gesture.deltaY) > Grid.page_height/2) {
                switch(ev.gesture.direction) {
                	case 'right':
                		// if (current_col > 0) left()
                		// else navToPane(current_row, current_col)
                		Grid.left()
                		break;

                	case 'left':
                		Grid.right()
                		break;

                	case 'up':
                		Grid.down()
                		break;

                	case 'down':
                		Grid.up()
                		break;
                }
            } else {
                Grid.navToPane(Grid.current_row, Grid.current_col)
            }
            break;
	}
}