
var Random = require("rs-random"),
	utility = require("../utility");

module.exports.initialize = function(universe) {
	var cast = function(event) {
		console.log("Casting Spell: ", event.message.data);
		var spell = universe.get(event.message.data.spell),
			damage = event.message.data.result || {},
			level = parseInt(event.message.data.spell_level),
			targets = [],
			difficulty,
			applyForm,
			attack,
			source,
			audio,
			load,
			sets,
			set,
			f,
			i;

		if(isNaN(level)) {
			level = spell.level || null;
		}
		if(event.message.data.checks && event.message.data.checks.length) {
			attack = event.message.data.checks[0].result;
		}

		applyFormIfApplicable = function(target) {
			if(target.caster === source.id && event.message.data.form) {
				sets = spell?spell.form_sets || spell.form_set:null;
				set = {};
				if(sets && sets.length) {
					for(i=0; i<sets.length; i++) {
						f = sets[i];
						set[f] = event.message.data.form[f];
					}
				} else {
					if(event.message.data.form.race) {
						set.race = event.message.data.form.race;
					}
					if(event.message.data.form.gender) {
						set.gender = event.message.data.form.gender;
					}
					if(event.message.data.form.hp) {
						set.hp = event.message.data.form.hp;
					}
				}
				target.setValues(set);
			}
		};

		source = event.message.data.source || event.message.data.entity;
		if(spell && source && (source = universe.get(source))) {
			if(level && spell.level && level < spell.level) {
				universe.warnMasters(source.name + " casting spell " + spell.name + " at a level below the spell (" + level + " < " + spell.level + ")");
			}

			if(event.message.data.target) {
				load = universe.get(event.message.data.target);
				if(load && !load.disabled && !load.is_preview) {
					targets.push(load);
					applyFormIfApplicable(load);
				}
			}
			
			if(event.message.data.targets) {
				for(i=0; i<event.message.data.targets.length; i++) {
					load = universe.get(event.message.data.targets[i]);
					if(load && !load.disabled && !load.is_preview) {
						targets.push(load);
						applyFormIfApplicable(load);
					}
				}
			}

			if(spell.dc === undefined || spell.dc === null) {
				difficulty = source.spell_dc;
			} else {
				difficulty = spell.dc;
			}

			console.log("Cast! ", event.message.data.form);
			if(event.message.data.form && event.message.data.form.audio) {
				universe.emit("roomctrl:play", event.message.data.form.audio);
			}
			if(spell.audio) {
				universe.emit("audio:play", spell.audio);
			}

			if(spell.cast_save) {
				utility.sendSaves(source, targets, level, spell, spell.cast_save, difficulty, damage, undefined, event.message.data.form);
			} else if(spell.cast_attack) {
				utility.sendDamages(source, targets, spell, damage, attack, event.message.data.targeted_checks, undefined, undefined, event.message.data.form);
			} else {
				utility.sendDamages(source, targets, spell, damage, attack, event.message.data.targeted_checks, undefined, undefined, event.message.data.form);
				console.log("Unclassed spell? " + spell.id);
			}
			
			load = {};
			load.spell_slots = {};
			load.spell_slots[level] = 1;
			load.action_count = spell.action_cost;
			console.log("Remove Slot: ", load);
			source.subValues(load, function(err, obj) {
				console.log("Subed: ", err);
			});
		} else {
			// TODO: Improve error handling
			console.error("Missing spell or source for cast: ", event);
		}
	};

	var castSpell = function(spell, level, source, target) {

	};

	return new Promise(function(done, fail) {
		
		/**
		 * 
		 * @event player:action:main:spell
		 * @for Universe
		 * @param {Object} event With data from the system
		 * @param {String} event.type The event name being fired, should match this event's name
		 * @param {Integer} event.received Timestamp of when the server received the event
		 * @param {Integer} event.sent Timestamp of when the UI sent the event (By the User's time)
		 * @param {RSObject} event.player That triggered the event
		 * @param {Object} event.message The payload from the UI
		 * @param {Object} event.message.type Original event type indicated by the UI
		 * @param {Object} event.message.sent The timestamp at which the event was sent by the UI (By the User's time)
		 * @param {Object} event.message.data Typical location of data from the UI
		 * @param {Object} event.message.data.attack Roll value
		 */
		universe.on("player:action:main:cast", function(event) {
			cast(event);
		});
		
		/**
		 * 
		 * @event player:action:cast:spell
		 * @for Universe
		 * @param {Object} event With data from the system
		 * @param {String} event.type The event name being fired, should match this event's name
		 * @param {Integer} event.received Timestamp of when the server received the event
		 * @param {Integer} event.sent Timestamp of when the UI sent the event (By the User's time)
		 * @param {RSObject} event.player That triggered the event
		 * @param {Object} event.message The payload from the UI
		 * @param {Object} event.message.type Original event type indicated by the UI
		 * @param {Object} event.message.sent The timestamp at which the event was sent by the UI (By the User's time)
		 * @param {Object} event.message.data Typical location of data from the UI
		 * @param {Object} event.message.data.attack Roll value
		 */
		universe.on("player:action:cast:spell", function(event) {
			cast(event);
		});
		
		/**
		 * 
		 * @event player:action:reaction:spell
		 * @for Universe
		 * @param {Object} event With data from the system
		 * @param {String} event.type The event name being fired, should match this event's name
		 * @param {Integer} event.received Timestamp of when the server received the event
		 * @param {Integer} event.sent Timestamp of when the UI sent the event (By the User's time)
		 * @param {RSObject} event.player That triggered the event
		 * @param {Object} event.message The payload from the UI
		 * @param {Object} event.message.type Original event type indicated by the UI
		 * @param {Object} event.message.sent The timestamp at which the event was sent by the UI (By the User's time)
		 * @param {Object} event.message.data Typical location of data from the UI
		 * @param {Object} event.message.data.attack Roll value
		 */
		universe.on("player:action:reaction:spell", function(event) {
			cast(event);
		});
		
		done();
	});
};
