
/**
 * Anchor point to get keyboard events.
 *
 * This additionally handles capturing events to the body to emit
 * or capture several events such as `Escape` and `F1`.
 * @property keyboard
 * @type EventEmitter
 * @module Main
 * @for rsSystem
 */
rsSystem.keyboard = (function() {
	var emitter = new EventEmitter(),
		DEFAULT = {},
		keymap = {},
		NAMING = {},
		KEY = {},
		endKey;

	// emitter.debug = 10;
	KEY.keymap = "sysem:keymap";

	/**
	 * Maps the DOM key location to a string for use within switch statements.
	 * @property DEVREF
	 * @type Object
	 */
	emitter.DEVREF = {
		"Keyboard": KeyboardEvent.DOM_KEY_LOCATION_STANDARD.toString(),
		"Right": KeyboardEvent.DOM_KEY_LOCATION_RIGHT.toString(),
		"Left": KeyboardEvent.DOM_KEY_LOCATION_LEFT.toString(),
		"Numpad": KeyboardEvent.DOM_KEY_LOCATION_NUMPAD.toString()
	}

	NAMING.location = {
		"0": "",
		"1": "Numpad:"
	};

	DEFAULT.keymap = {
		"0": {									// Location
			"F1": {								// Key
				"_": "system:help",
				"ctrl": "character:attack",
				"alt": "character:info"
			},
			"F2": {
				"_": "character:attack",
				"ctrl": "character:info",
				"alt": "characterinfo:attack"
			},
			"F10": {
				"_": "system:menu"
			},
			"1": {
				"_": null,
				"ctrl": "character:attack",
				"alt": "characterinfo:attack"
			}
		}
	};



	endKey = function(event) {
		event.preventDefault();
		if(typeof(event.stopPropogation) === "function") {
			event.stopPropogation();
		}
	};

	document.onkeyup = function(e) {
		if(keymap[e.location] && keymap[e.location][e.key]) {
			if(e.altKey && keymap[e.location][e.key].alt) {
				endKey(e);
			} else if(e.ctrlKey && keymap[e.location][e.key].ctrl) {
				endKey(e);
			} else if(e.shiftKey && keymap[e.location][e.key].shift) {
				endKey(e);
			} else if(keymap[e.location][e.key]._ && !e.ctrlKey && !e.altKey && !e.shiftKey) {
				endKey(e);
			}
		}
	};

	document.onkeydown = function(e) {
		var debug = rsSystem.debug || rsSystem.keyboard.debug;
		if(debug >= 10) {
			console.log("Key Dn[" + e.location + "]: ", e, keymap[e.location]?keymap[e.location][e.key]:"No Location: " + e.location);
		} else if(debug >= 5) {
			console.log("Key Dn[" + e.location + "]: " + e.key, keymap[e.location]?keymap[e.location][e.key]:"No Location: " + e.location);
		}

		if(keymap[e.location] && keymap[e.location][e.key]) {
			if(e.altKey && e.ctrlKey && e.shiftKey && keymap[e.location][e.key].acs) {
				emitter.$emit(keymap[e.location][e.key].acs);
				endKey(e);
			} else if(e.altKey && keymap[e.location][e.key].alt) {
				emitter.$emit(keymap[e.location][e.key].alt);
				endKey(e);
			} else if(e.ctrlKey && keymap[e.location][e.key].ctrl) {
				emitter.$emit(keymap[e.location][e.key].ctrl);
				endKey(e);
			} else if(e.shiftKey && keymap[e.location][e.key].shift) {
				emitter.$emit(keymap[e.location][e.key].shift);
				endKey(e);
			} else if(keymap[e.location][e.key]._ && !e.ctrlKey && !e.altKey && !e.shiftKey) {
				emitter.$emit(keymap[e.location][e.key]._);
				endKey(e);
			}
		}
	};

	(function() {
		var loading,
			load;

		loading = localStorage.getItem(KEY.keymap);
		if(loading) {
			try {
				loading = JSON.parse(loading);
			} catch(fault) {
				console.warn("Failed to parse saved keymap");
				loading = {};
			}
		} else {
			loading = {};
		}

		for(load in DEFAULT.keymap) {
			keymap[load] = rsSystem.utility.clone(DEFAULT.keymap[load]);
		}
		for(load in loading) {
			if(keymap[load]) {
				Object.assign(keymap[load], loading[load]);
			} else {
				keymap[load] = loading[load];
			}
		}
	})();

	/**
	 * Maps a Key name (ie. "F1" or "a") to an object that maps "", "alt", and "ctrl" as keys
	 * for the various modifiers which in turn map to events to emit from here for handling
	 * keyboard activity.
	 * 
	 * All "normal ascii" keys should generally have null for the "" event so that they are
	 * ignored but user's can override this if they like.
	 * @property keymap
	 * @type Object
	 */
	emitter.keymap = keymap;

	/**
	 * Used to update the key mapping
	 * @event system:keymap:set
	 * @param {Object} event
	 * @param {String} event.key
	 * @param {Boolean} event.alt
	 * @param {Boolean} event.ctrl
	 * @param {String} event.emit The string of the event to emit or null to clear the key from
	 * 		firing anything.
	 */
	emitter.$on("system:keymap:set", function(event) {
		emitter.setKeybind(event.location, event.key, event.emit, event.alt, event.ctrl, event.shift, event.old);
	});

	emitter.$on("system:keymap:default", function(event) {
		emitter.restoreDefaultKeymap();
	});

	emitter.restoreDefaultKeymap = function() {
		var load,
			keys,
			i;

		keys = Object.keys(keymap);
		for(i=0; i<keys.length; i++) {
			delete(keymap[keys[i]]);
		}
		for(load in DEFAULT.keymap) {
			keymap[load] = rsSystem.utility.clone(DEFAULT.keymap[load]);
		}

		localStorage.setItem(KEY.keymap, JSON.stringify(keymap));
		emitter.$emit("system:keymap:defaulted");
		emitter.$emit("system:keymap:updated");
	};

	/**
	 * 
	 * @method setKeybind
	 * @param {String} location 
	 * @param {String} key 
	 * @param {String} emit 
	 * @param {Boolean} alt 
	 * @param {Boolean} ctrl 
	 * @param {Boolean} shift 
	 * @param {Keybind} {old} The keybind to clean up, if any.
	 * @returns {Keybind} The keybind that was set
	 */
	emitter.setKeybind = function(location, key, emit, alt, ctrl, shift, old) {
		var set = {
			"location": location,
			"emit": emit,
			"key": key
		};

		if(!keymap[location]) {
			keymap[location] = {};
		}
		if(!keymap[location][key]) {
			keymap[location][key] = {};
		}

		if(old) {
			if(old.location && keymap[old.location] && keymap[old.location][old.key]) {
				delete(keymap[old.location][old.key][old.modifier || "_"]);
			}
		}

		if(key) {
			if(alt) {
				set.modifier = "alt";
				if(emit === null) {
					delete(keymap[location][key].alt);
				} else {
					keymap[location][key].alt = emit;
				}
			} else if(ctrl) {
				set.modifier = "ctrl";
				if(emit === null) {
					delete(keymap[location][key].ctrl);
				} else {
					keymap[location][key].ctrl = emit;
				}
			} else if(shift) {
				set.modifier = "shift";
				if(emit === null) {
					delete(keymap[location][key].shift);
				} else {
					keymap[location][key].shift = emit;
				}
			} else {
				if(emit === null) {
					delete(keymap[location][key]._);
				} else {
					keymap[location][key]._ = emit;
				}
			}
		}

		if(key || old) {
			localStorage.setItem(KEY.keymap, JSON.stringify(keymap));
			emitter.$emit("system:keymap:updated");
		}

		return set;
	};

	/**
	 * Loop over all the bindings in the keymap.
	 * 
	 * Each binding has 4 properties:
	 * + location : The location of the key such as "0" for the keyboard or "1" for the numpad
	 * + key : The key that triggers the binding, such as "F2" (See KeyboardEvent.key)
	 * + modifier : The modifier key used to trigger the binding (Only 1 modifier per key at this time)
	 * + emit : The event that the binding emits
	 * 
	 * @method forEach
	 * @param {Function} process The function to call for each keybind. Returning null will stop the loop.
	 */
	emitter.forEach = function(process) {
		var location,
			modifier,
			result,
			key;

		for(location in keymap) {
			for(key in keymap[location]) {
				for(modifier in keymap[location][key]) {
					result = process({
						"location": location,
						"key": key,
						"modifier": modifier === "_"?undefined:modifier,
						"emit": keymap[location][key][modifier]
					});

					if(result === false) {
						return null;
					}
				}
			}
		}
	};

	return emitter;
})();

rsSystem.keyboard.$on("system:help", function() {
	// TODO: Display Help
});

rsSystem.keyboard.$on("system:menu", function() {
	rsSystem.EventBus.$emit(rsSystem.object_reference.events.options.type, rsSystem.object_reference.events.options);
});

rsSystem.keyboard.$on("character:info", function() {
	var character = rsSystem.universe.getPlayerCharacter();
	if(character) {
		rsSystem.EventBus.$emit("display-info", {
			"info": character.id
		});
	} else {
		console.warn(" > No Player Character");
	}
});

rsSystem.keyboard.$on("character:attack", function() {
	var universe = rsSystem.universe,
		player = universe.getPlayer(),
		bus = rsSystem.EventBus,
		details = {};

	if(player && (details.entity = universe.index.entity[player.attribute.playing_as])) {
		details.title = details.entity.name + " Attack";
		details.component = "dndDialogDamage";
		bus.$emit("dialog-open", details);
	}
});

/**
 * 
 * @class Keybind
 * @constructor
 */

/**
 * The device origin ID for the keybind such as "0" for the keyboard or "1" for the numpad.
 * @property location
 * @type String
 */

/**
 * The key that triggers the binding, such as "F2" (See KeyboardEvent.key)
 * @property key
 * @type String
 */

/**
 * The modifier key used to trigger the binding (Only 1 modifier per key at this time).
 * 
 * If this is not set, then the keybind is for the key itself. The keybind mapping uses "_" for
 * the property on the map when descending the lookup object.
 * @property modifier
 * @type String
 */

/**
 * The event that the binding emits
 * @property emit
 * @type String
 */
