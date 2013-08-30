function Vis(options) {
	var active, name, svg, data;

	name           = options.name || "visualization";
	initFunc       = options.init;
	activateFunc   = options.activate;
	deactivateFunc = options.deactivate;

	function init() {
		console.log("Initializing " + name)

		active = false;

		initFunc(svg, data);
	}

	function activate() {
		if (active) return;

		console.log("Activating " + name)
		active = true;

		activateFunc(svg, data);
	}

	function deactivate() {
		if (!active) return;

		console.log("Deactivating " + name)
		active = false;

		deactivateFunc(svg, data);
	}

	// expose the API
	return {
		init: init,
		activate: activate,
		deactivate: deactivate
	}
}