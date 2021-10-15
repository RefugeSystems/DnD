module.exports.initialize = function(universe) {
	/**
	 * 
	 * @event player:object:update
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
	 * @param {Object} event.message.id
	 */
	universe.on("player:object:update", function(event) {
		var object = universe.get(event.message.id);
		if(object && (event.player.gm || (object.owned && object.owned[event.player.id]))) {
			object.refresh();
		}
	});

	/**
	 * 
	 * @event player:object:describe
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
	 * @param {Object} event.message.id
	 */
	universe.on("player:object:describe", function(event) {
		var description = event.message.data.description,
			id = event.message.data.id,
			entity,
			object,
			x;

		if(id && (object = universe.get(id)) && (event.player.gm || ((entity = universe.get(object.character)) && entity.owned[event.player.id]))) {
			// console.log(" [object:describe]>> ", event.message.data);
			if(!object.is_singular) {
				object.setValues({
					"description": description
				});
			} else {
				// TODO: Non-Editable Record
			}
		} else {
			// TODO: Security Event
		}
	});
};
