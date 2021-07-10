// Assist function for Reactive Component Printing
var _p = function(x) {
	if(x === undefined) {
		return undefined;
	} else if(x === null) {
		return null;
	} else if(typeof(x) === "object") {
		return JSON.parse(JSON.stringify(x));
	} else {
		return x;
	}
};


/**
 *
 * Specifically loaded last to trigger initialization.
 * @class App
 * @constructor
 * @module Main
 * @static
 */
rsSystem.App = new Vue({
	"el": "#game",
	"data": function() {
		return {
			"settings": {}
		};
	},
	"mounted": function() {
		rsSystem.EventBus.$emit("sys-ready");
		/*
		rsSystem.Router.addRoute({
			"path": "/",
			"component": rsSystem.components.RSHome
		});
		*/
	},
	"router": rsSystem.Router,
	"props": {
	},
	"created": function() {

	}
});

rsSystem.diagnostics = {};
rsSystem.diagnostics.at = {};
rsSystem.diagnostics.at.start = Date.now();
