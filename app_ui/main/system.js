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
		rsSystem.Router.addRoutes([{
			"path": "/",
			"component": rsSystem.components.RSHome,
			"children": [{
				"path": "network/:construct?/:oid?",
				"component": rsSystem.components.RSNetworking
			}, {
				"path": "nouns/:type?/:oid?",
				"component": rsSystem.components.RSNounControls
			}, {
				"path": "universe",
				"component": rsSystem.components.RSUniverse
			}, {
				"path": "about",
				"component": rsSystem.components.RSAbout
			}, {
				"path": "account",
				"component": rsSystem.components.RSAccount
			}, {
				"path": "system",
				"component": rsSystem.components.RSSystem
			}]
		}]);
	},
	"router": rsSystem.Router,
	"props": {
	},
	"created": function() {

	}
});
