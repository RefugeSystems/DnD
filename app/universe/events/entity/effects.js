var EventUtility = require("../utility"),
	Random = require("rs-random");

module.exports.initialize = function(universe) {
	/**
	 * 
	 * Requires GameMaster
	 * @event player:effect:revoke
	 * @for Universe
	 * @param {Object} event With data from the system
	 * @param {String} event.type The event name being fired, should match this event's name
	 * @param {Integer} event.received Timestamp of when the server received the event
	 * @param {Integer} event.sent Timestamp of when the UI sent the event (By the User's time)
	 * @param {RSObject} event.player That triggered the event
	 * @param {Object} event.message The payload from the UI
	 * @param {Object} event.message.type Original event type indicated by the UI; Should be "error:report"
	 * @param {Object} event.message.sent The timestamp at which the event was sent by the UI (By the User's time)
	 * @param {Object} event.message.data Typical location of data from the UI
	 * @param {Array | String} event.message.data.effects IDs to revoke
	 * @param {Array | String} [event.message.data.from] IDs of Entities from which to remove the effects. As active effects
	 * 		normally have a populated `character` property for calculating various values from, this is normally
	 * 		not needed.
	 */
	universe.on("player:effect:revoke", function(event) {
		var effects = event.message.data.effects,
			from = event.message.data.from,
			subtractions = {},
			characterMap = {},
			characters = [],
			character,
			effect,
			i,
			j;

		for(i=0; i<effects.length; i++) {
			effect = universe.manager.effect.object[effects[i]];
			// console.log("Check Effect: " + effects[i]);
			if(effect && effect.character) {
				// console.log(" > Read Effect: " + effect.id);
				if(!effect.is_locked || event.player.gm) {
					if(characterMap[effect.character]) {
						character = characterMap[effect.character];
					} else {
						character = characterMap[effect.character] = universe.manager.entity.object[effect.character];
					}
					if(character) {
						// console.log(" > Character: " + character.id);
						if(!subtractions[character.id]) {
							characterMap[character.id] = character;
							subtractions[character.id] = [];
							characters.push(character.id);
						}
						subtractions[character.id].push(effect.id);
						effect.setValues({
							"revoked": universe.time,
							"unsyncable": true,
							"is_deletable": true
						});
					}
				}
			}
		}
		// console.log("Revoking: " + JSON.stringify(subtractions, null, 4));
		for(i=0; i<characters.length; i++) {
			character = characterMap[characters[i]];
			if(character.owned[event.player.id] || event.player.gm) {
				character.subValues({
					"effects": subtractions[character.id]
				});
				universe.emit("entity:effects:loss", {
					"target": character,
					"effects": subtractions[character.id],
					"damage": false,
					"saved": false,
					"hit": false
				});
			}
		}
		if(from) {
			for(i=0; i<from.length; i++) {
				character = universe.manager.entity.object[from[i]];
				if(event.player.gm || (character && character.owned[event.player.id])) {
					character.subValues({
						"effects": effects
					});
					/**
					 * 
					 * @event entity:effects:loss
					 * @param {RSObject} target Entity losing the effect
					 * @param {Array} effects The effects being lost
					 */
					universe.emit("entity:effects:loss", {
						"target": character,
						"effects": effects,
						"damage": false,
						"saved": false,
						"hit": false
					});
				}
			}
		}
	});
	
	/**
	 * 
	 * Requires GameMaster
	 * @event player:effect:grant
	 * @for Universe
	 * @param {Object} event With data from the system
	 * @param {String} event.type The event name being fired, should match this event's name
	 * @param {Integer} event.received Timestamp of when the server received the event
	 * @param {Integer} event.sent Timestamp of when the UI sent the event (By the User's time)
	 * @param {RSObject} event.player That triggered the event
	 * @param {Object} event.message The payload from the UI
	 * @param {Object} event.message.type Original event type indicated by the UI; Should be "error:report"
	 * @param {Object} event.message.sent The timestamp at which the event was sent by the UI (By the User's time)
	 * @param {Object} event.message.data Typical location of data from the UI
	 * @param {Array | String} event.message.data.effects IDs of effects to grant
	 * @param {String} event.message.data.target ID of Entity to which to grant the effects
	 * @param {String} [event.message.data.channel] 
	 * @param {String} [event.message.data.damaged] 
	 * @param {String} [event.message.data.source] ID of Entity from which to grant the effects
	 * @param {String} [event.message.data.saved] 
	 * @param {String} [event.message.data.level] 
	 * @param {String} [event.message.data.hit] 
	 */
	universe.on("player:effect:grant", function(event) {
		var effects = event.message.data.effects,
			damaged = event.message.data.damaged,
			channel = event.message.data.channel,
			target = event.message.data.target,
			source = event.message.data.source,
			saved = event.message.data.saved,
			level = event.message.data.level,
			hit = event.message.data.hit,
			waiting = [],
			i;

		if(event.player && event.player.gm) {
			if(effects && target) {
				universe.transcribeArray(effects);
				target = universe.get(target);
				if(channel) {
					channel = universe.get(channel);
				}
				if(source) {
					source = universe.get(source);
				}
				for(i=0; i<effects.length; i++) {
					waiting.push(universe.copyPromise(effects[i]));
				}
				Promise.all(waiting)
				.then(function(copies) {
					EventUtility.instillEffects(universe, copies, source, target, channel, hit, damaged, saved, level);
				})
				.catch(function(error) {
					console.log("Error granting effects: ", error);
				});
			} else {
				console.log("Missing effects or target:\n" + JSON.stringify(event.message.data, null, 4));
			}
		} else {
			// Authorization issue
			universe.generalError("master:effects:grant", null, "Invalid attempt to grant an effect", event);
		}
	});
};
