function Segue(element, options) {
  // make sure we have instructions here
  if (!element || !options.manipulator) {
    console.log("Warning: Segue invoked without a root element or any manipulator... I can't work with this!")
    return;
  }

  // defaults
  var options = options || {},
    manipulator = options.manipulator,
    min = options.min || 0,
    max = options.max || 100,
    complete = (options.complete != undefined) ? options.complete : true, // might be a better way to do this?
    toggle_on_tap = (options.toggle_on_tap != undefined) ? options.toggle_on_tap : false,
    orientation = (options.orientation) || 'horizontal',
    states = options.states - 1 || 1,
    initial_state = options.initial_state || 0,
    elastic = options.elastic || true,
    elasticity = (options.elasticity != undefined) ? 1 - options.elasticity : .8, // default is (1-.2) = .8 here
    reverse = (options.reverse != undefined) ? options.reverse : false;

  var state = initial_state,
      percent = 0;

  console.log(state)

  function handleDrag(ev) {
    ev.gesture.preventDefault();
    ev.gesture.stopPropagation();

    var delta;

    switch(orientation) {
      case 'horizontal':
        delta = ev.gesture.deltaX;

        break;

      case 'vertical':
        delta = ev.gesture.deltaY;

        break;

      case 'radial':
        // radial is still pretty iffy...
        if (Math.abs(ev.gesture.deltaX) > Math.abs(ev.gesture.deltaY)) {
          delta = ev.gesture.deltaX;
        } else {
          delta = ev.gesture.deltaY;
          if (state + percent < (states + percent)/2) delta *= -1;
        }


        break;
    }

    if (reverse) delta *= -1;

    percent = delta / (max - min);

    if (elastic) {
      if (percent + state > states) {
        percent = percent - (percent)*elasticity;
      } else if (percent + state < 0) {
        percent = percent - (percent)*elasticity;
      }
    }

    manipulator(percent, state, false, element)
  }

  function nextState() {
    if (!reverse) {
      if (state < states) state++;
    } else {
      if (state > 0) state--;
    }
  }

  function prevState() {
    if (!reverse) {
      if (state > 0) state--;
    } else {
      if (state < states) state++;
    }
  }

  function cycleState() {
    if (state < states) state++;
    else state = 0;
  }

  function handleComplete(ev) {
    if (ev) {
      switch(ev.type) {
        case 'swipe':
          if (orientation == 'vertical') {
            if (ev.gesture.direction == 'up') prevState();
            if (ev.gesture.direction == 'down') nextState();
          } else {
            if (ev.gesture.direction == 'left') prevState();
            if (ev.gesture.direction == 'right') nextState();
          }

          ev.gesture.stopDetect();

          break

        case 'release':
          var percent = ev.gesture.distance / (max - min);

          if (percent >= .5) {
            switch (orientation) {
            case 'vertical':
              if (ev.gesture.direction == 'up') prevState();
              if (ev.gesture.direction == 'down') nextState();

              break;

            case 'horizontal':
              if (ev.gesture.direction == 'left') prevState();
              if (ev.gesture.direction == 'right') nextState();

              break;

            case 'radial':
              // FIXME: Handle radial motions better!
              if (ev.gesture.direction == 'left') prevState();
              if (ev.gesture.direction == 'right') nextState();

              break;
            }
          }

          break;
      }
    }

    manipulator(state, 0, true, element);
    $(element).trigger('statechange', state)
  }

  function handleToggle() {
    cycleState();
    handleComplete();
  }

  function setup() {
    Hammer(element).on('drag', handleDrag);


    Hammer(element).on('swipe release', handleComplete);
    if (toggle_on_tap) Hammer(element).on('tap', handleToggle);

    handleComplete();
  }

  setup();

  return {
    next: function() {
      nextState();
      handleComplete();
    },

    prev: function() {
      prevState();
      handleComplete();
    }
  }
}

// Segue(slider, {
//  min: 0, // default = 0
//  max: 100, // default = 100
//  manipulator: dragSlider,
//  complete: true, // default = true
//  toggle_on_tap: true, // default = false
//  orientation: 'horizontal' // default = horizontal
// })

// Segue(slider, dragSlider) // should also work

// function dragSlider(percent, animate, element (optional))