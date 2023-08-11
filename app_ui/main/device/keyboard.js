
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
		KEY = {},
		endKey;

	KEY.keymap = "sysem:keymap";

	DEFAULT.keymap = {
		"F1": {
			"": "system:help",
			"ctrl": "character:attack",
			"alt": "character:info"
		},
		"F2": {
			"": "character:attack",
			"ctrl": "character:info",
			"alt": "characterinfo:attack"
		},
		"F10": {
			"": "system:menu"
		},
		"1": {
			"": null,
			"ctrl": "character:attack",
			"alt": "characterinfo:attack"
		}
	};

	endKey = function(event) {
		event.preventDefault();
		if(typeof(event.stopPropogation) === "function") {
			event.stopPropogation();
		}
	};

	document.onkeyup = function(e) {
		if(rsSystem.debug >= 5) {
			console.log("Key Up: " + e.key, keymap[e.key]);
		} else if(rsSystem.debug >= 10) {
			console.log("Key Up: ", e, keymap[e.key]);
		}

		if(keymap[e.key]) {
			if(e.altKey && keymap[e.key].alt) {
				endKey(e);
			} else if(e.ctrlKey && keymap[e.key].ctrl) {
				endKey(e);
			} else if(keymap[e.key][""]) {
				endKey(e);
			}
		}
	};

	document.onkeydown = function(e) {
		if(rsSystem.debug >= 5) {
			console.log("Key Dn[" + e.code + "]: " + e.key);
		} else if(rsSystem.debug >= 10) {
			console.log("Key Dn: ", e);
		}

		if(keymap[e.key]) {
			if(e.altKey && keymap[e.key].alt) {
				emitter.$emit(keymap[e.key].alt);
				endKey(e);
			} else if(e.ctrlKey && keymap[e.key].ctrl) {
				emitter.$emit(keymap[e.key].ctrl);
				endKey(e);
			} else if(keymap[e.key][""]) {
				emitter.$emit(keymap[e.key][""]);
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
		emitter.setKeybind(event.key, event.emit, event.alt, event.ctrl, event.old);
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

	emitter.setKeybind = function(key, emit, alt, ctrl, old) {
		if(!keymap[key]) {
			keymap[key] = {};
		}

		if(key) {
			if(alt) {
				if(emit === null) {
					delete(keymap[key].alt);
				} else {
					keymap[key].alt = emit;
				}
			} else if(ctrl) {
				if(emit === null) {
					delete(keymap[key].ctrl);
				} else {
					keymap[key].ctrl = emit;
				}
			} else {
				if(emit === null) {
					delete(keymap[key][""]);
				} else {
					keymap[key][""] = emit;
				}
			}
		}

		if(typeof(old) === "string") {
			if(old.startsWith("ctrl")) {
				old = old.replace("ctrl +", "").trim();
				delete(keymap[old].ctrl);
			} else if(old.startsWith("alt")) {
				old = old.replace("alt +", "").trim();
				delete(keymap[old].alt);
			} else {
				delete(keymap[old][""]);
			}
		}

		if(key || old) {
			localStorage.setItem(KEY.keymap, JSON.stringify(keymap));
			emitter.$emit("system:keymap:updated");
		}
	}

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
