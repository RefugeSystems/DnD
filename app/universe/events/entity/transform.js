
module.exports.initialize = function(universe) {
	
	/**
	 * 
	 * @event player:character:transform
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
	 * @param {String} event.message.data.character The character being transformed (Ideally also the current player
	 * 		character). TODO: UI display support for the new veil entity between the original entity and their new transformed
	 * 		entity.
	 * @param {String} event.message.data.transform The target to transform into
	 * @param {String} event.message.data.polymorph When set, stores the current entity data and replaces it with
	 * 		the transform source data instead of shimming a copy.
	 */
	universe.on("player:character:transform", function(event) {
		var character = event.message.data.character,
			transform = event.message.data.transform,
			polymorph = event.message.data.polymorph,
			player = event.player,
			player_attr,
			handlers,
			handler,
			mask,
			i;

		if(typeof(character) === "string") {
			character = universe.manager.entity.object[character];
		}
		if(typeof(transform) === "string") {
			transform = universe.manager.entity.object[transform];
		}
		
		// Manually pull the handler that should automatically manage reverting to the base form on 0HP
		handler = universe.manager.entity.object["handler:transformation:revert"];
		if(!handler) {
			universe.notifyMasters("Player transforming and unable to find transformation handler", event.message.data);
		}

		if(character && character.owned[player.id] && transform && event.player.attribute.playing_as === character.id) {
			handlers = transform.handlers || [];
			handlers.push(handler.id);

			mask = {};
			mask.transform_character = character.id;
			mask.transform_player = player.id;
			mask.character = character.id;
			mask.hp = transform.hp_max;
			mask.handlers = handlers;
			mask.owned = {};
			mask.owned[player.id] = Date.now();

			universe.createObject(mask, function(error, transformed) {
				if(error) {
					// TODO: Log Error
					universe.notifyMasters("Error during Player transformation creation: " + error.message, event.message.data);
				} else {
					player_attr = Object.assign({}, player.attribute);
					player_attr.playing_as = transformed.id;
					player.setValues({
						"attribute": player_attr
					});
				}
			});

			if(transform.review) {
				universe.notifyMasters("Player transformed into an entity marked for Review", {
					"data": event.message.data,
					"info": transform.id
				});
			}
		}
	});
	
	/**
	 * 
	 * @event player:character:untransform
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
	 * @param {String} event.message.data.character 
	 */
	universe.on("player:character:untransform", function(event) {
		var character = event.message.data.character,
			player = event.player,
			player_attr;

		if(typeof(character) === "string") {
			character = universe.manager.entity.object[character];
		}

		if(character && character.owned[player.id] && character.transform_player === player.id && character.transform_character) {
			player_attr = Object.assign({}, player.attribute);
			player_attr.playing_as = character.transform_character;
			player.setValues({
				"attribute": player_attr
			});
		}
	});
};
