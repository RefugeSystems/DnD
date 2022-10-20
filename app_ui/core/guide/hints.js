/**
 * 
 * @class rsSystem.hints
 * @constructor
 * @static
 */
rsSystem.hints = rsSystem.hints || {};

(function() {
	var storageKey = "system:hints",
		timeout = 30000,
		buildCache,
		universe;

	/**
	 * 
	 * @property cached
	 * @type Object
	 */
	rsSystem.hints.cached = localStorage.getItem(storageKey);
	if(rsSystem.hints.cached) {
		rsSystem.hints.cached = JSON.parse(rsSystem.hints.cached);
	} else {
		rsSystem.hints.cached = {};
	}

	/**
	 * Initialize the hint handler 
	 * @method initialize
	 * @param {RSUniverse} universe 
	 */
	rsSystem.hints.initialize = function(uni) {
		universe = uni;

		universe.$on("master:thinking", function(event) {
			console.log("Load Hint: Master");

		});

		universe.$on("system:thinking", function(event) {
			console.log("Load Hint: System");
		});
	};

	rsSystem.addInitialization(rsSystem.hints.initialize);
})();
