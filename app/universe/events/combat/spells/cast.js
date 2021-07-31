
var Random = require("rs-random"),
	utility = require("../utility");

module.exports.initialize = function(universe) {
	var cast = function(event) {
		console.log(event.message.data);
		var spell = universe.get(event.message.data.spell),
			damage = event.message.data.result || {},
			level = parseInt(event.message.data.spellLevel),
			attack = event.message.data.attack,
			targets = [],
			difficulty,
			source,
			load,
			i;

		if(isNaN(level)) {
			level = null;
		}

		source = event.message.data.source || event.message.data.entity;
		if(source && (source = universe.get(source))) {
			if(event.message.data.target) {
				load = universe.get(event.message.data.target);
				if(load && !load.disabled && !load.is_preview) {
					targets.push(load);
				}
			}
			
			if(event.message.data.targets) {
				for(i=0; i<event.message.data.targets.length; i++) {
					load = universe.get(event.message.data.targets[i]);
					if(load && !load.disabled && !load.is_preview) {
						targets.push(load);
					}
				}
			}

			if(spell.dc === undefined) {
				difficulty = source.spell_dc;
			} else {
				difficulty = spell.dc;
			}

			if(spell.cast_save) {
				utility.sendSaves(source, targets, level, spell, spell.cast_save, difficulty, damage);
			} else if(spell.cast_attack) {
				utility.sendDamages(source, targets, spell, damage, attack);
			} else {
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
			console.error("No source for cast");
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
		
		done();
	});
};
