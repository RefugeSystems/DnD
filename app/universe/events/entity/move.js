
module.exports.initialize = function(universe) {
	/**
	 * 
	 * @event player:entity:move
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
	 * @param {String} event.message.data.entity
	 * @param {String} event.message.data.location
	 * @param {String} event.message.data.x
	 * @param {String} event.message.data.y
	 */
	universe.on("player:entity:move", function(event) {
		var entity = event.message.data.entity || event.message.data.object,
			location = event.message.data.location,
			x = event.message.data.x,
			y = event.message.data.y;

		if(typeof(location) === "string") {
			location = universe.manager.location.object[location];
		}
		if(typeof(entity) === "string") {
			entity = universe.manager.entity.object[entity];
		}
		if(typeof(x) === "string") {
			x = parseFloat(x);
		}
		if(typeof(y) === "string") {
			y = parseFloat(y);
		}

		if(entity && location && typeof(x) === "number" && typeof(y) === "number" && (event.player.gm || entity.owned[event.player.id])) {
			entity.setValues({
				"location": location.id,
				"x": x,
				"y": y
			});
			entity.addValues({
				"action_count": {
					"movement": -1
				}
			});
		} else {
			// TODO: Error handling and integrity warnings
			universe.warnMasters("Entity failed to move by player action", event.message.data);
		}
	});
};
