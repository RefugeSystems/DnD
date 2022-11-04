/**
 * 
 * @class rsSystem.hints
 * @constructor
 * @static
 */
rsSystem.hints = rsSystem.hints || {};

(function() {
	var storageKey = "system:hints",
		useStorage = false,
		timeout = 30000,
		current = 0,
		universe,
		player,
		id;

	/**
	 * 
	 * @property cached
	 * @type Object
	 */
	if(useStorage) {
		rsSystem.hints.cached = localStorage.getItem(storageKey);
		if(rsSystem.hints.cached) {
			rsSystem.hints.cached = JSON.parse(rsSystem.hints.cached);
		} else {
			rsSystem.hints.cached = {};
		}
	} else {
		rsSystem.hints.cached = {};
	}
	if(!rsSystem.hints.cached._last) {
		rsSystem.hints.cached._last = [];
	}

	for(id in rsSystem.hints.cached) {
		if(current < rsSystem.hints.cached[id]) {
			current = rsSystem.hints.cached[id];
		}
	}

	/**
	 * Initialize the hint handler 
	 * @method initialize
	 * @param {RSUniverse} universe 
	 */
	rsSystem.hints.initialize = function(uni) {
		player = uni.index.player[uni.connection.session.player];
		universe = uni;

		universe.$on("master:thinking", function(event) {
			console.log("Load Hint: Master");
			rsSystem.hints.displayRandomHint();
		});

		universe.$on("system:thinking", function(event) {
			console.log("Load Hint: System");
			rsSystem.hints.displayRandomHint();
		});
	};

	rsSystem.addInitialization(rsSystem.hints.initialize);

	rsSystem.hints.debugPrint = function() {
		console.log("Hints: " + current + "\n", _p(rsSystem.hints.cached), "\nPlayer:\n", _p(player));
	};
	

	/**
	 * 
	 * @method displayRandomHint
	 */
	rsSystem.hints.displayRandomHint = function() {
		var hints = rsSystem.universe.listing.hint,
			hint,
			i;

		for(i=0; i<10; i++) {
			hint = hints[Random.integer(hints.length)];
			if(rsSystem.utility.isValid(hint)
					&& rsSystem.hints.cached._last[0] !== hint.id
					&& rsSystem.hints.cached._last[1] !== hint.id
					&& rsSystem.hints.cached._last[2] !== hint.id
					&& rsSystem.hints.cached._last[3] !== hint.id
					&& (!rsSystem.hints.cached[hint.id] || rsSystem.hints.cached[hint.id] < current)) {
				return rsSystem.hints.showHint(hint);
			}
		}

		for(i=0; i<hints.length; i++) {
			hint = hints[i];
			if(rsSystem.utility.isValid(hint) && (!rsSystem.hints.cached[hint.id] || rsSystem.hints.cached[hint.id] < current)) {
				return rsSystem.hints.showHint(hint);
			}
		}

		current++;
		rsSystem.hints.displayRandomHint();
	};

	/**
	 * 
	 * @method showHint
	 * @param {Object} hint
	 */
	rsSystem.hints.showHint = function(hint) {
		if(!rsSystem.universe.profile.hints_disabled && !player.gm && (!player.attribute || !player.attribute.is_display)) {
			// Display Hint Toast
			rsSystem.EventBus.$emit("message", {
				"id": "hint",
				"message": ["Did you remember?", hint.name],
				"icon": "fa-beat-fade " + (hint.icon || "fa-solid fa-face-clouds"),
				"anchored": false,
				"timeout": 20000,
				"emission": {
					"type": "dialog-open",
					"component": "rs-dialog-hint",
					"hint": hint
				}
			});

			// Store new display count for device
			if(rsSystem.hints.cached[hint.id]) {
				rsSystem.hints.cached[hint.id]++;
			} else {
				rsSystem.hints.cached[hint.id] = 1;
			}
			rsSystem.hints.cached._last.push(hint.id);
			if(4 < rsSystem.hints.cached._last.length) {
				rsSystem.hints.cached._last.shift();
			}
			if(useStorage) {
				localStorage.setItem(storageKey, JSON.stringify(rsSystem.hints.cached));
			}

			// Increment count for random selection repeat reduction
			if(current < rsSystem.hints.cached[hint.id]) {
				current = rsSystem.hints.cached[hint.id];
			}
		} else {
			console.warn("Show Hint Suppressed by Profile: ", hint);
		}
	};
})();
