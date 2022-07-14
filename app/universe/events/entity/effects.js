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
			}
		}
		if(from) {
			for(i=0; i<from.length; i++) {
				character = universe.manager.entity.object[from[i]];
				if(event.player.gm || (character && character.owned[event.player.id])) {
					character.subValues({
						"effects": effects
					});
				}
			}
		}
	});
};
